python3 -m venv myenv    

 python ./myenv/bin/activate  

 .\myenv\Scripts\activate   

# Stock Prediction
Run `pipenv update` to sync the pipfile, then install and shell

### Regardless
Navigate to the root directory of the project. And run:

`pipenv install`

This will install all of the required Python modules.
Activate the virtual environment with

`pipenv shell`

Next run all migrations for database with

`./manage.py makemigrations`

and apply them

`./manage.py migrate`
#### If you are getting issues with the python version, make sure your ide is using the pipenv interpreter

## Running

cd stockpre-web
npm install request --legacy-peer-deps
$env:NODE_OPTIONS="--openssl-legacy-provider";
npm run build
cd ..
python manage.py collectstatic

`python manage.py runserver` or python manage.py runsslserver     

