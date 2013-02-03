class ApplicationMonitor
  def initialize
    config = YAML::load(File.open('sites.yaml'))
  end  

  def method_missing
    
  end  
end
