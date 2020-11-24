curl -sL https://get.garden.io/install.sh | bash

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