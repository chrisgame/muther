require './app.rb'

notification :tmux,
  :display_message => true,
  :timeout => 5,
  :default_message_format => '%s >> %s',
  :line_separator => ' > ',
  :color_location => 'status-left-bg'

guard('sprockets2',
      :sprockets => Muther.sprockets,
      :assets_path => Muther.assets_path,
      :precompile => Muther.precompile,
      :digest => Muther.digest_assets) do

  watch %r(^assets/.+$)
  watch 'app.rb'
end

guard :rspec do
  watch(%r{^spec/.+_spec\.rb$})
	watch(%r{^api-wrappers/(.+)\.rb$}) {|m| "spec/lib/#{m[1]}_spec.rb"}
end
