require 'html-proofer'

task :html_proofer do
  HTMLProofer.check_directory('./dist', {
    :only_4xx => true, :empty_alt_ignore => true, :log_level => 'debug',
    :typhoeus => { 
      :timeout => 5 }
  }).run
end
