require 'bundler'
Bundler.require(:default, :assets, ENV['RACK_ENV'].to_sym)
class Muther
  module Assets
    class Environment
      def self.get(root_path, preprocess = false)
        assets = Sprockets::Environment.new root_path

        assets.append_path('assets/stylesheets')
        assets.append_path('assets/javascripts')

        if preprocess
          assets.css_compressor = YUI::CssCompressor.new
          assets.js_compressor = Uglifier.new
        end

        return assets
      end
    end
  end
end
