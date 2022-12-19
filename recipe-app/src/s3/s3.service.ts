import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppConfigService } from 'src/appconfig/appconfig.service'
import * as dotenv from 'dotenv'
// import { AppService } from 'src/app.service'

dotenv.config()

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

  async uploadImage(imageName: string, file: string | Blob) {
    const response = await this.s3_upload(imageName, file)
    const url = 'https://${this.AWS_S3_BUCKET}.s3.amazonaws.com/${imageName}'
    return { imageName, url }
  }

  async s3_upload(
    name: string,
    file: string | Blob,
    bucket: string = this.AWS_S3_BUCKET,
  ) {
    // PutObjectCommand(input: PutObjectCommandInput): PutObjectCommand
    // Body: PutObjectRequest["Body"] | string | Uint8Array | Buffer
    // PutObjectRequest.Body: Readable | ReadableStream | Blob
    const uploadParams = {
      Bucket: bucket,
      Key: name,
      Body: file,
      ACL: 'public-read',
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
}
