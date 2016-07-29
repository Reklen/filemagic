# Filemagic

Filemagic is a file uploader with a beautiful and simple interface, built with React on frontend and using [Refile](https://github.com/refile/refile) gem on backend to upload to S3.

Showcase demo [here](#)

![alt text](http://i.giphy.com/26hit1IFe3a5YtvhK.gif "Title")


## Install

### Dependencies:

#### Gemfile
Add:
- gem 'sprockets', '~> 3.4.0'
- gem 'sprockets-es6', '~> 0.8.0'
- gem "refile-mini_magick", "~> 0.2.0"

Remove:
- gem 'turbolinks'

#### JavaScript
Filemagic is jQuery dependent, it uses many jQuery plugins:
- jQuery fileupload
- jQuery UI
- jQuery UI Widget
- jQuery Iframe Transport Plugin

So ensure your project imports jQuery.

### application.js
  - remove turbolinks
  - require filemagic

### application.css
  - require/import filemagic

### application.html.erb
  - remove turbolinks from stylesheet and javascript tags

## Configuration

Create a `filemagic.rb` file on config/initializers.
If using S3 to cache/store files needs to have refile cache/store configurated, if S3 cache/store is not set on initializer file Refile will use host FileSystem to store images.

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

Add mount route to `routes.rb`

```ruby
mount Filemagic::Engine => "/filemagic"
```

### S3 Bucket CORS config
Add a CORS xml configuration file to your S3 bucket.
Cross-origin resource sharing (CORS) defines a way for client web applications that are loaded in one domain to interact with resources in a different domain.

```xml
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>http://localhost:3000</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
  </CORSRule>
</CORSConfiguration>
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

To call images on any view, use `attachment_url` helper:

```ruby
image_tag attachment_url(post, :cover_image, :fill, 100, 100)
```


## Input options
Filemagic input have some options to customize:

### 1. Preview size
Preview size can be customized with a `preview_size` option:
```ruby
<%= f.filemagic_field :cover_image, preview_size: {width: '100px', height: '100px'} %>
```

### 2. Actions
Action Buttons can be activated per field with an array passed through `actions`:
```ruby
<%= f.filemagic_field :cover_image, actions: ['remove', 'reposition'] %>
```

#### 2.1 Remove
Add a `remove` button, allowing user to set a new or remove a file from model

#### 2.2 Reposition
Allow user to reposition image inside a visible window. Like a crop, but it's not a crop. (Crop feature will be able soon).
Important: reposition feature stores values on model as coordinates, so it depends on having 2 string attributes on model:
- `<name_of_field>offset_x`
- `<name_of_field>offset_y`

Create a migration:
```ruby
rails g migration add_cover_image_offset_to_posts cover_image_offset_x cover_image_offset_y
```

And edit migration file to have default to `+0`
```ruby
  t.string :cover_image_offset_x, default: '+0'
  t.string :cover_image_offset_y, default: '+0'
```

## License
This project rocks and uses [MIT-LICENSE](MIT-LICENSE)
