Filemagic::Engine.routes.draw do
  post '/image_upload', to: 'image#upload', as: :image_upload
  delete '/image_upload', to: 'image#delete'
end
