module Filemagic
  class ImageController < Filemagic::ApplicationController
    def upload
      file = params["files"][0]
      refile_file = Refile.store.upload(file)
      url = Refile.file_url(Refile.store.get(refile_file.id), filename: 'img.gif')

      return_json = { files: [{ url: url }] }

      render json: return_json, content_type: request.format, status: 200
    end

    def delete
      return_json = { files: [{"picture1.jpg" => true}] }

      render json: return_json, content_type: request.format
    end
  end
end