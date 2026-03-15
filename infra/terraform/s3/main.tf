resource "aws_s3_bucket" "product_images" {
  bucket = var.bucket_name

  tags = {
    Project = "vendex"
  }
}

resource "aws_s3_bucket_public_access_block" "block" {
  bucket = aws_s3_bucket.product_images.id

  block_public_acls       = true
  block_public_policy     = true
  restrict_public_buckets = true
}