from django.conf import settings
from web3 import Web3
from ens import ENS

w3 = Web3(Web3.HTTPProvider(settings.CHAIN_PROVIDER))
ns = ENS.fromWeb3(w3)

def get_ens_name(address):
    if w3.isAddress(address):
        return ns.name(address=address)
    return None

def verify_signature(signature, message, address):
    if w3.isAddress(address):
        return w3.eth.account.recoverHash(message, signature=signature) == address
    return False

def hex_signature(string):
    return Web3.keccak(text=string).hex()

def get_abi(contract_name):
    return settings.ABIS[contract_name]