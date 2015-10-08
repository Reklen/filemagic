# Filemagic

This project rocks and uses MIT-LICENSE.

## Install

### Gemfile:
  - Add:
    - gem 'sprockets', '~> 3.4.0'
    - gem 'sprockets-es6'
    - gem "refile-mini_magick", "~> 0.2.0"

  - Remove:
    - gem 'turbolinks'

### application.js
  - remove turbolinks
  - require filemagic

### application.css
  - require/import filemagic

### application.html.erb
  - remove turbolinks from stylesheet and javascript tags

## Configuration

Create a `filemagic.rb` file on config/initializers.
It needs to have refile cache parameters:

```ruby
require "refile/s3"

aws = {
  access_key_id: Rails.application.secrets.aws_access_key_id,
  secret_access_key: Rails.application.secrets.aws_secret_access_key,
  region: Rails.application.secrets.aws_region,
  bucket: Rails.application.secrets.aws_bucket,
}

Refile.cache = Refile::S3.new(prefix: "cache", **aws)
Refile.store = Refile::S3.new(prefix: "store", **aws)

Refile.cdn_host = Rails.application.secrets.cdn_host if Rails.env.production?
```

## Usage

Add a field to desired model (eg: cover_image)

```rails g migration add_cover_image_id_to_posts cover_image_id:string```

Add field as attachment on model:

```ruby
class Post < ActiveRecord::Base
  attachment :cover_image
end
```

Add input on form:

```ruby
<%= f.filemagic_field :cover_image %>
```

Whitelist attribute on strong parameters controller:

```ruby
def post_params
  params.require(:post).permit(:title, :cover_image)
end
```

To check images on view, use `attachment_url` helper:

```ruby
image_tag attachment_url(post, :cover_image, :fill, 100, 100)
```

