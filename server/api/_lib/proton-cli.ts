import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { access, chmod, mkdir, readFile, rename, rm, unlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'

const CREDENTIALS_FILE_NAME = 'auth-session.json'
const SEALED_CREDENTIALS_FILE_NAME = 'auth-session.enc'
const SESSION_ID_PATTERN = /^[a-f0-9]{64}$/

interface LoginAttempt {
  child: ChildProcessWithoutNullStreams
  status: 'pending' | 'failed'
  cancelled: boolean
}

interface ProtonCliContext {
  directory: string
  run: (args: string[]) => Promise<string>
}

const loginAttempts = new Map<string, LoginAttempt>()

// ponytail: a global queue is enough for an MVP; use per-session queues if throughput matters.
let cliQueue: Promise<unknown> = Promise.resolve()

export function createProtonSessionId() {
  return randomBytes(32).toString('hex')
}

export function isProtonSessionId(value: string | undefined): value is string {
  return value !== undefined && SESSION_ID_PATTERN.test(value)
}

export async function beginProtonLogin(sessionId: string): Promise<string> {
  assertSessionId(sessionId)
  getEncryptionKey()
  await deleteProtonSession(sessionId)

  const directory = await getSessionDirectory(sessionId)
  const child = spawnProtonCli(directory, ['auth', 'login', '--json'])
  const attempt: LoginAttempt = { child, status: 'pending', cancelled: false }
  loginAttempts.set(sessionId, attempt)

  void finishLogin(sessionId, directory, attempt)

  try {
    return await waitForSignInUrl(child)
  }
  catch (error) {
    attempt.cancelled = true
    child.kill()
    loginAttempts.delete(sessionId)
    await rm(directory, { recursive: true, force: true })
    throw error
  }
}

export async function getProtonLoginStatus(sessionId: string | undefined) {
  if (!isProtonSessionId(sessionId))
    return { signedIn: false, pending: false }

  if (await fileExists(getSealedCredentialsPath(sessionId)))
    return { signedIn: true, pending: false }

  const attempt = loginAttempts.get(sessionId)

  return {
    signedIn: false,
    pending: attempt?.status === 'pending',
    ...(attempt?.status === 'failed' && {
      error: 'Proton Drive login failed. Check the server log and try again.',
    }),
  }
}

export async function deleteProtonSession(sessionId: string | undefined) {
  if (!isProtonSessionId(sessionId))
    return

  const attempt = loginAttempts.get(sessionId)

  if (attempt) {
    attempt.cancelled = true
    attempt.child.kill()
    loginAttempts.delete(sessionId)
  }

  const queued = cliQueue.then(async () => {
    await rm(getSessionDirectoryPath(sessionId), { recursive: true, force: true })
  })

  cliQueue = queued.catch(() => undefined)
  await queued
}

export async function withProtonCliSession<T>(
  sessionId: string,
  action: (context: ProtonCliContext) => Promise<T>,
): Promise<T> {
  assertSessionId(sessionId)

  const queued = cliQueue.then(async () => {
    const directory = getSessionDirectoryPath(sessionId)
    const credentialsPath = join(directory, CREDENTIALS_FILE_NAME)
    const sealedCredentials = await readFile(getSealedCredentialsPath(sessionId))
      .catch(() => undefined)

    if (!sealedCredentials)
      throw new Error('You must be signed in to Proton Drive.')

    await writeFile(credentialsPath, unsealCredentials(sessionId, sealedCredentials), { mode: 0o600 })

    try {
      return await action({
        directory,
        run: async args => await runProtonCli(directory, [...args, '--json']),
      })
    }
    finally {
      const updatedCredentials = await readFile(credentialsPath).catch(() => undefined)

      if (updatedCredentials)
        await sealCredentials(sessionId, updatedCredentials)

      await unlink(credentialsPath).catch(() => undefined)
    }
  })

  cliQueue = queued.catch(() => undefined)
  return await queued
}

async function finishLogin(
  sessionId: string,
  directory: string,
  attempt: LoginAttempt,
) {
  try {
    const { code, stderr } = await waitForExit(attempt.child)

    if (attempt.cancelled)
      return

    if (code !== 0)
      throw new Error(stderr.trim() || `Proton Drive CLI exited with code ${code}`)

    const credentials = await readFile(join(directory, CREDENTIALS_FILE_NAME))
    await sealCredentials(sessionId, credentials)

    if (attempt.cancelled) {
      await rm(directory, { recursive: true, force: true })
      return
    }

    loginAttempts.delete(sessionId)
  }
  catch (error) {
    if (!attempt.cancelled) {
      attempt.status = 'failed'
      console.error('Proton Drive login failed:', error)
    }
  }
  finally {
    await unlink(join(directory, CREDENTIALS_FILE_NAME)).catch(() => undefined)
  }
}

async function waitForSignInUrl(child: ChildProcessWithoutNullStreams): Promise<string> {
  return await new Promise((resolve, reject) => {
    let stdout = ''
    const timeout = setTimeout(() => reject(new Error('Proton Drive CLI did not start login in time.')), 30_000)

    const fail = (error: unknown) => {
      clearTimeout(timeout)
      reject(error)
    }

    child.once('error', fail)
    child.once('exit', code => fail(new Error(`Proton Drive CLI exited before login started (${code}).`)))
    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString()

      for (const line of stdout.split('\n')) {
        try {
          const value = JSON.parse(line) as { signInUrl?: unknown }

          if (typeof value.signInUrl === 'string') {
            clearTimeout(timeout)
            resolve(value.signInUrl)
            return
          }
        }
        catch {
          // The CLI may emit partial JSON while stdout is still streaming.
        }
      }
    })
  })
}

async function runProtonCli(directory: string, args: string[]) {
  const child = spawnProtonCli(directory, args)
  let stdout = ''
  let stderr = ''

  child.stdout.on('data', (chunk: Buffer) => stdout += chunk.toString())
  child.stderr.on('data', (chunk: Buffer) => stderr += chunk.toString())

  const result = await waitForExit(child)

  if (result.code !== 0)
    throw new Error(stderr.trim() || `Proton Drive CLI exited with code ${result.code}`)

  return stdout
}

function spawnProtonCli(directory: string, args: string[]) {
  return spawn(process.env.PROTON_DRIVE_CLI_PATH || 'proton-drive', args, {
    env: {
      ...process.env,
      PROTON_DRIVE_CACHE_DIR: directory,
      PROTON_DRIVE_CREDENTIALS_STORE: 'unsafe_file',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

async function waitForExit(child: ChildProcessWithoutNullStreams) {
  let stderr = ''
  child.stderr.on('data', (chunk: Buffer) => stderr += chunk.toString())

  const code = await new Promise<number | null>((resolve, reject) => {
    child.once('error', reject)
    child.once('close', resolve)
  })

  return { code, stderr }
}

async function sealCredentials(sessionId: string, credentials: Buffer) {
  const nonce = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), nonce)
  cipher.setAAD(Buffer.from(sessionId))
  const encrypted = Buffer.concat([cipher.update(credentials), cipher.final()])
  const sealed = Buffer.concat([nonce, cipher.getAuthTag(), encrypted])
  const target = getSealedCredentialsPath(sessionId)
  const temporary = `${target}.${randomBytes(8).toString('hex')}.tmp`

  await writeFile(temporary, sealed, { mode: 0o600 })
  await rename(temporary, target)
}

function unsealCredentials(sessionId: string, sealed: Buffer) {
  if (sealed.length < 29)
    throw new Error('Invalid Proton Drive session.')

  const decipher = createDecipheriv('aes-256-gcm', getEncryptionKey(), sealed.subarray(0, 12))
  decipher.setAAD(Buffer.from(sessionId))
  decipher.setAuthTag(sealed.subarray(12, 28))
  return Buffer.concat([decipher.update(sealed.subarray(28)), decipher.final()])
}

function getEncryptionKey() {
  const secret = process.env.PROTON_SESSION_SECRET

  if (!secret)
    throw new Error('PROTON_SESSION_SECRET is required.')

  return createHash('sha256').update(secret).digest()
}

async function getSessionDirectory(sessionId: string) {
  const root = process.env.PROTON_SESSION_DIR || join(tmpdir(), 'seasoned-proton-sessions')
  await mkdir(root, { recursive: true, mode: 0o700 })
  await chmod(root, 0o700)

  const directory = getSessionDirectoryPath(sessionId)
  await mkdir(directory, { mode: 0o700 })
  return directory
}

function getSessionDirectoryPath(sessionId: string) {
  const root = process.env.PROTON_SESSION_DIR || join(tmpdir(), 'seasoned-proton-sessions')
  return join(root, sessionId)
}

function getSealedCredentialsPath(sessionId: string) {
  return join(getSessionDirectoryPath(sessionId), SEALED_CREDENTIALS_FILE_NAME)
}

async function fileExists(path: string) {
  return await access(path).then(() => true, () => false)
}

function assertSessionId(sessionId: string) {
  if (!isProtonSessionId(sessionId))
    throw new Error('Invalid Proton Drive session.')
}
