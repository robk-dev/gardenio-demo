Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/garden-io/garden/master/support/install.ps1'))

# change terminal
git clone https://github.com/garden-io/garden.git
cd garden/examples/demo-project-start

garden create project

cd backend
garden create module
cd ../frontend
garden create module
cd ..

garden deploy

garden test