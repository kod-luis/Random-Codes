#function to show data from a Brazilian address when user input a CEP and getting a response from 'viacep.com.br'
def get_endereco(request, **kwargs):
    import json
    endereco = json.loads(kwargs.get('str'))
		#cidade = city
    cidade = models.Cidade.objects.filter(cod_ibge=endereco['ibge']).get()
		#bairro = neighborhood
    bairros = models.Bairro.objects.filter(cidade=cidade)
    bairros_nome = list(models.Bairro.objects.filter(cidade=cidade).values_list('nome', flat=True))
    bairro_json = endereco['bairro'] if endereco.get('bairro') else ''
    bairro_id = int()

		#verify if the response has 'bairro' info
    if bairro_json:
        #verify if 'bairro' doesn't exist in DB
        if not bairro_json.lower() in [nome.lower() for nome in bairros_nome]:
            #if 'bairro' doesn't exist, create it
            lista_bairros = bairros.order_by('bairro')
            new_cod_bairro = int(list(lista_bairros)[len(lista_bairros)-1].bairro + 1)
            new_nome_bairro = bairro_json
            new_cidade_bairro = cidade
            new_empresa_bairro = utils.get_empresa_logada(request)
            
            #new 'bairro' instance
            new_bairro = models.Bairro(bairro=new_cod_bairro, nome=new_nome_bairro, cidade=new_cidade_bairro, empresa=new_empresa_bairro)
            #save it
            new_bairro.save()
            
            #update the 'bairro' search to add the new one
            bairros = models.Bairro.objects.filter(cidade=cidade)
    
        #data from 'bairro' that was informed via CEP
        bairro_cep = bairros.filter(nome=bairro_json).get()

		#create the json response
    response = {
        'endereco' : endereco['logradouro'] if endereco.get('logradouro') else '',
        'cidade_id' : cidade.pk,
        'cidade' : f'{cidade.cod_ibge} - {cidade.nome}, {cidade.uf}',
        'bairros_lista' : [
            {
                'cod': bairro.pk,
                'desc': f'{bairro.bairro} - {bairro.nome}'
            }
            for bairro in bairros
        ],
        'bairro_id' : bairro_cep.pk if bairro_json else '',
        'bairro' : f'{bairro_cep.bairro} - {bairro_cep.nome}' if bairro_json else ''
    }
		return JsonResponse(response, safe=False, json_dumps_params={'ensure_ascii': False})
