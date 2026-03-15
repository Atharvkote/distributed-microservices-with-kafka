module "s3_bucket" {
  source = "./s3"

  bucket_name = var.bucket_name
}