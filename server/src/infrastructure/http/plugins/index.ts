
import config from './config.plugin.ts'
import prisma from './prisma.plugin.ts'
import s3Client from './s3-client.plugin.ts'
import mail from './mail.plugin.ts'
import storage from './storage.plugin.ts'
import encryption from './encryption.plugin.ts'
import settings from './settings.plugin.ts'
import redis from './redis.plugin.ts'
import multipartUpload from './multipart-upload.plugin.ts'
import websocket from './websocket.plugin.ts'
import messageBroker from './message-broker.plugin.ts'
import cache from './cache.plugin.ts'
import cors from './cors.plugin.ts'
import errorHandler from './error-handler.plugin.ts'
import auth from './auth.plugin.ts'
import adminPermissions from './admin-permissions.plugin.ts'
import adminAccess from './admin-access.plugin.ts'
import octetStream from './octet-stream.plugin.ts'
import multipartValidation from './multipart-validation.plugin.ts'
import di from './di.plugin.ts'
import eventBus from './event-bus.plugin.ts'

export default {
    config,
    prisma,
    s3Client,
    mail,
    storage,
    encryption,
    settings,
    errorHandler,
    redis,
    multipartUpload,
    websocket,
    messageBroker,
    cache,
    cors,
    auth,
    adminPermissions,
    adminAccess,
    octetStream,
    multipartValidation,
    di,
    eventBus
}