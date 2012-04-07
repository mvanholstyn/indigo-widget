task :default => :install

task :install do
  system "cp -r . /tmp/indigo.wdgt"
  system "open /tmp/indigo.wdgt"
end

task :restart do
  system "killall DashboardClient"
end