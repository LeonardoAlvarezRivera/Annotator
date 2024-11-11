import streamlit as st

from template.my_component import example

'''
import streamlit_authenticator as stauth
import yaml
from yaml.loader import SafeLoader
with open('template/credentials.yaml') as file:
    config = yaml.load(file, Loader=SafeLoader)
from my_component import example

authenticator = stauth.Authenticate(
    config['credentials'],
    config['cookie']['name'],
    config['cookie']['key'],
    config['cookie']['expiry_days'],
    config['pre-authorized']
)


st.session_state['authenticator']= authenticator

name, authentication_status, username = authenticator.login('main')

if authentication_status:
    example.open(name, authenticator)
elif authentication_status == False:
    st.error('Username/password is incorrect')
elif authentication_status == None:
    st.warning('Please enter your username and password')
'''
example.open()