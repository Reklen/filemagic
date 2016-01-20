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
end

class ActionView::Helpers::FormBuilder
  def filemagic_field(attribute_name, options={})
    preview_size = options[:preview_size] || {}
    preview_url = Refile.attachment_url(@object, attribute_name) || ''

    is_file_field = options[:is_file_field] || false

    input_html_options = options[:input_html] || false

    custom_attribute_name = input_html_options ?  input_html_options[:name] : false

    data_attributes = {
      component: 'Uploader',
      object: object_name,
      attribute: attribute_name,
      custom_attribute_name: custom_attribute_name,
      preview_size: preview_size,
      preview_url: preview_url,
      as: "file",
      url: "/attachments/cache",
      fields: {},
      is_file_field: is_file_field
      }

    data_attributes = data_attributes.merge(Refile.cache.presign.as_json) if Refile.cache.class.method_defined?(:presign)

    @template.content_tag(:div, nil, { class: 'js-component filemagic-container', data: data_attributes})
  end
end
