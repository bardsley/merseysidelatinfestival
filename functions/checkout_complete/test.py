response = {
    'metadata':{
        'info1': "A string of info",
        'info2': "A second string of info",
    }
}

meal = response['metadata']['meal'] if 'meal' in response['metadata'] else None

print(meal)