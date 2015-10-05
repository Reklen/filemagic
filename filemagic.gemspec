$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "filemagic/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "filemagic"
  s.version     = Filemagic::VERSION
  s.authors     = ["William Kurosawa"]
  s.email       = ["will@flama.me"]
  s.homepage    = "http://flama.me"
  s.summary     = "Summary of Filemagic."
  s.description = "Description of Filemagic."
  s.license     = "MIT"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.rdoc"]
  s.test_files = Dir["test/**/*"]

  s.add_dependency "rails", "~> 4.2.4"

  s.add_development_dependency "sqlite3"
end
