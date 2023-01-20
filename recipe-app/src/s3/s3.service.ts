import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppConfigService } from 'src/appconfig/appconfig.service'
import * as dotenv from 'dotenv'
import { Readable } from 'stream'
import { FileUpload } from 'src/recipe/interface/fileUpload.interface'
import { stream2buffer } from 'src/util/stream2buffer'
// import { AppService } from 'src/app.service'

dotenv.config()

export type imageUrl = {
  filename: string
  url: string
}

@Injectable()
export class S3Service {
  //   @Inject()
  //   private config: ConfigService
  AWS_S3_BUCKET = process.env.AWS_S3_BUCKET!
  //   AWS_S3_BUCKET = AppConfigService.get('AWS_S3_BUCKET')
  s3Client = new S3Client({
    region: process.env.AWS_S3_Region,
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_S3_KEY_SECRET!,
    },
  })

  async uploadImage(
    imageName: string,
    file: string | Blob | Buffer | Readable | ReadableStream,
  ): Promise<imageUrl> {
    const response = await this.s3_upload(imageName, file)
    const url = `https://${this.AWS_S3_BUCKET}.s3.amazonaws.com/recipe/${imageName}`
    return { filename: imageName, url }
  }

  async _uploadMultipleImages(
    images: Promise<FileUpload>[],
  ): Promise<imageUrl[]> {
    let urls: imageUrl[] = []
    for (let i of images) {
      const { filename, mimetype, encoding, createReadStream } = await i
      const stream = createReadStream()
      const buffer = await stream2buffer(stream)
      const result = await this.uploadImage(filename, buffer)
      urls.push(result)
    }
    return urls
  }

  async deleteImage(imageName: string) {
    try {
      const response = await this.s3_delete(imageName)
    } catch (e) {
      throw e
    }
  }

  async s3_upload(
    name: string,
    file: string | Blob | Buffer | Readable | ReadableStream,
    bucket: string = this.AWS_S3_BUCKET,
  ) {
    // PutObjectCommand(input: PutObjectCommandInput): PutObjectCommand
    // Body: PutObjectRequest["Body"] | string | Uint8Array | Buffer
    // PutObjectRequest.Body: Readable | ReadableStream | Blob
    const uploadParams = {
      Bucket: bucket,
      Key: 'recipe/' + name,
      Body: file,
      //   ACL: 'public-read',
      //   ContentType: mimetype,
      //   ContentDisposition: 'inline',
      //   CreateBucketConfiguration: {
      //     LocationConstraint: 'ap-south-1',
      //   },
    }

    console.log(uploadParams)

    try {
      //   let s3Response = await this.s3.upload(params).promise()
      const data = await this.s3Client.send(new PutObjectCommand(uploadParams))
      console.log(
        'Successfully uploaded object: ' +
          uploadParams.Bucket +
          '/' +
          uploadParams.Key,
      )

      return data // For unit tests.
    } catch (e) {
      console.log('Error', e)
    }
  }

  async s3_delete(filename: string, bucket: string = this.AWS_S3_BUCKET) {
    const deleteParams = {
      Bucket: bucket,
      Key: 'recipe/' + filename,
    }
    console.log(deleteParams)

    try {
      //   let s3Response = await this.s3.upload(params).promise()
      const data = await this.s3Client.send(
        new DeleteObjectCommand(deleteParams),
      )
      console.log(
        'Success. Object deleted.' +
          deleteParams.Bucket +
          '/' +
          deleteParams.Key,
      )
      return data // For unit tests.
    } catch (e) {
      //   console.log('Error', e)
      throw e
    }
  }
}
