import path from 'node:path'
import fs from 'node:fs/promises'
import Application from '@ioc:Adonis/Core/Application'

export default class Mutex {
    
    protected drive: MutexDrive

    constructor(key: string) {
        this.drive = new MutexLocalFsDrive(key)
        this.drive.config({
            cachePath: Application.tmpPath('cache/mutex')
        })
    }

    public static async acquire(key, option = {
        throwError: false
    }) {
        const mutex = new Mutex(key)
        if (await mutex.drive.acquire()) {
            return mutex
        } else {
            if (option.throwError) {
                throw new MutexAcquireError
            } else {
                return false
            }
        }
    }

    public async release() {
        return this.drive.release()
    }
}

interface MutexDrive {
    key: string
    config(config: MutexLocalFsDriveConfig)
    acquire: () => Promise<boolean>
    release: () => Promise<void>
}

interface MutexLocalFsDriveConfig {
    cachePath: string
}

class MutexAcquireError extends Error {
    public code = 'E_MUTEX_ACQUIRE'
    public message = 'Failed to acquire Mutex'
}

class MutexLocalFsDrive implements MutexDrive {

    protected cachePath: string

    constructor(public key: string) {}

    get urlSafeKey() {
        return encodeURIComponent(this.key)
    }

    get fileName() {
        const file = path.join(this.cachePath, this.urlSafeKey)
        return file
    }

    config(config: MutexLocalFsDriveConfig) {
        this.cachePath = config['cachePath']
    }

    async acquire() {
        try {
            await fs.mkdir(this.cachePath, {
                recursive: true
            })
            const handle = await fs.open(this.fileName, 'wx')
            await handle?.close()
            return true
        } catch (error) {
            return false
        }
    }

    async release() {
        await fs.unlink(this.fileName)
    }
}
