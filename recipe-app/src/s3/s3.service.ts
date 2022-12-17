import { S3Client } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'

@Injectable()
export class S3Service {
  AWS_S3_BUCKET = process.env.AWS_S3_BUCKET
  s3 = new S3Client({
    region: process.env.AWS_S3_Region,
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_S3_KEY_SECRET!,
    },
  })

  async uploadImage(imageName: string, file: string) {
    const { originalname } = file

    await this.s3_upload(
      file.buffer,
      this.AWS_S3_BUCKET,
      originalname,
      file.mimetype,
    )
  }

  async s3_upload(file, bucket, name, mimetype) {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: 'ap-south-1',
      },
    }

    console.log(params)

    try {
      let s3Response = await this.s3.upload(params).promise()

      console.log(s3Response)
    } catch (e) {
      console.log(e)
    }
  }
}
