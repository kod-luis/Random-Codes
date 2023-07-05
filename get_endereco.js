//functions to set a Brazilian address when CEP is informed (front-end)

function setAddress(event){
	var cep = document.getElementById("id_cep").value;
	//verify if CEP was typed
	if (cep != ''){
	//verify if it's only numbers
	if (/^\d+$/.test(cep)){
		//verify if it has 8 digits
		if (cep.length == 8) {
			//set the request for 'viacep.com.br' to get address info
			let request = new XMLHttpRequest();
			let method = "GET";
			let url = 'https://viacep.com.br/ws/' + cep + '/json/';
			request.open(method, url);
			request.onload = function() {
				var endjson = request.response;
				var parsedJSON = JSON.parse(endjson);
				if (!parsedJSON.erro) {
					if (parsedJSON.complemento) {
						if (parsedJSON.complemento.indexOf("/") > -1) {
							parsedJSON.complemento = parsedJSON.complemento.replace("/", "-");
						}
					}
	
					endjson = JSON.stringify(parsedJSON);
	
					//set the request for the Django back-end for other infos
					let newrequest = new XMLHttpRequest();
					let newmethod = "GET";
					let newurl = document.getElementById("cep_div").getAttribute("data-url");
					newurlcut = newurl.slice(0, newurl.indexOf('k'))+endjson;
					newrequest.open(newmethod, newurlcut);
					newrequest.onload = function(){
						var newendereco = JSON.parse(newrequest.response);
						//select the informed city via CEP
						document.getElementById("id_endereco").value = newendereco.endereco;
						document.getElementById("select2-id_cidade-container").innerHTML = newendereco.cidade;
						document.getElementById("id_cidade").value = newendereco.cidade_id;
						//remake the neighborhood list on html (fuction bellow)
						setBairro(newendereco.bairros_lista);
						//select the informed neighborhood via CEP
						document.getElementById("select2-id_bairro-container").innerHTML = newendereco.bairro;
						document.getElementById("id_bairro").value = newendereco.bairro_id;
					};
					newrequest.send();
				} else {
					//show error (fuction bellow)
					exibirErro('ERRO! CEP não existe! Favor verificar!');
				}
			};
			request.send();
		} else {
			//show error (function bellow)
			exibirErro('ERRO! O número precisa ter 8 dígitos (Exemplo: 00000000)')
		}
		} else {
			//show error (function bellow)
			exibirErro('ERRO! Digite apenas NÚMEROS (Exemplo: 00000000)');
		}
	}
}

//change the HTML list of neighborhoods
function setBairro(bairros){
	var select_bairro = document.getElementById("id_bairro");
	var v = "";
	
	for (var i = 0; i < bairros.length; i++) {
		v += "<option value='" + bairros[i]["cod"] + "'>" + bairros[i]["desc"] + "</option>"
	}
	select_bairro.innerHTML = v;
}

//show error div
function exibirErro(mensagem) {
	var errorDiv = document.getElementById("errorDiv");
	errorDiv.innerText = mensagem;
	errorDiv.classList.add("alert", "alert-danger", "alert-dismissible");
	errorDiv.style.display = "block";

	var contentDiv = document.getElementById("content-div");
	contentDiv.parentNode.insertBefore(errorDiv, contentDiv);

	setTimeout(function() {
		errorDiv.style.display = "none";
	}, 5000);
}
