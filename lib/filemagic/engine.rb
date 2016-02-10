require 'refile/rails'

module Filemagic
  class Engine < ::Rails::Engine
    isolate_namespace Filemagic

    initializer 'filemagic.action_controller' do |app|
      ActiveSupport.on_load :action_controller do
        helper Filemagic::ApplicationHelper
      end
    end
  end

  class CustomProcessors < Refile::MiniMagick

    def reposition(img, width, height, offset_x = '+0', offset_y = '+0')
      ::MiniMagick::Tool::Convert.new do |cmd|
        yield cmd if block_given?
        cmd.gravity "Center"
        cmd.crop "#{img.width}x#{height}#{offset_x}#{offset_y}"
        cmd.resize "#{width}x#{height}"
        cmd.merge! [img.path, img.path]
      end
    end

    def call(file, *args, format: nil, &block)
      img = ::MiniMagick::Image.new(file.path)
      img.format(format.to_s.downcase, nil) if format
      send(@method, img, *args, &block)

      ::File.open(img.path, "rb")
    end

  end

end

[:reposition].each do |name|
  Refile.processor(name, Filemagic::CustomProcessors.new(name))
end

class ActionView::Helpers::FormBuilder
  def filemagic_field(attribute_name, options={})
    image_size = options[:image_size] || {}
    preview_size = options[:preview_size] || {}
    preview_url = Refile.attachment_url(@object, attribute_name) || ''

    is_file_field = options[:is_file_field] || false

    actions = options[:actions] || false

    input_html_options = options[:input_html] || false

    custom_attribute_name = input_html_options ?  input_html_options[:name] : false

    data_attributes = {
      component: 'Uploader',
      object: object_name,
      attribute: attribute_name,
      custom_attribute_name: custom_attribute_name,
      image_size: image_size,
      preview_size: preview_size,
      preview_url: preview_url,
      as: "file",
      url: "/attachments/cache",
      fields: {},
      is_file_field: is_file_field,
      actions: actions
      }

    data_attributes = data_attributes.merge(Refile.cache.presign.as_json) if Refile.cache.class.method_defined?(:presign)

    @template.content_tag(:div, nil, { class: 'fm-uploader-wrapper', data: data_attributes})
  end
end

Refile::Attacher.class_eval do
  Presence = ->(val) { val if val != "" }

  def width
    Presence[@metadata[:width] || read(:width)]
  end

  def height
    Presence[@metadata[:height] || read(:height)]
  end

  def offset_x
    Presence[@metadata[:offset_x] || read(:offset_x)]
  end

  def offset_y
    Presence[@metadata[:offset_y] || read(:offset_y)]
  end

  def write_metadata
    write(:size, size)
    write(:content_type, content_type)
    write(:filename, filename)
    write(:width, width)
    write(:height, height)
    write(:offset_x, offset_x)
    write(:offset_y, offset_y)
  end

  def remove_metadata
    write(:size, nil)
    write(:content_type, nil)
    write(:filename, nil)
    write(:width, nil)
    write(:height, nil)
    write(:offset_x, nil)
    write(:offset_y, nil)
  end
end
