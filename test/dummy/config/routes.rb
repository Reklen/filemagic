Rails.application.routes.draw do
  resources :posts

  root to: 'posts#index'

  mount Filemagic::Engine => "/filemagic"
end
