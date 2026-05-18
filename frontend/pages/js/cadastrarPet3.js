  const optionButtons = document.querySelectorAll(".btn-option");

  optionButtons.forEach(button => {

    button.addEventListener("click", () => {

      optionButtons.forEach(btn => {
        btn.classList.remove("active-blue");
        btn.classList.remove("active-orange");
        btn.classList.remove("active-red");
      });

      const texto = button.innerText.trim();

      // SIM = azul
      if(texto === "Sim"){
        button.classList.add("active-blue");
      }

      // NÃO = vermelho
      if(texto === "Não"){
        button.classList.add("active-red");
      }

      // NÃO SEI = laranja
      if(texto === "Não Sei"){
        button.classList.add("active-orange");
      }

    });

  });


  // DROPDOWN

  const toggleDropdown = document.getElementById("toggleDropdown");
  const dropdown = document.getElementById("dropdown");

  toggleDropdown.addEventListener("click", () => {
    dropdown.classList.toggle("active");
  });


  // ADICIONAR VACINAS

  const dropdownItems = document.querySelectorAll(".dropdown-item");
  const vacinasContainer = document.getElementById("vacinasContainer");

  dropdownItems.forEach(item => {

    item.addEventListener("click", () => {

      const vacinaNome = item.innerText;

      const existe = document.querySelector(
        `[data-vacina="${vacinaNome}"]`
      );

      if(existe){
        alert("Vacina já adicionada.");
        return;
      }

      const card = document.createElement("div");

      card.classList.add("vacina-card");

      card.setAttribute("data-vacina", vacinaNome);

      card.innerHTML = `
      
        <div class="vacina-top">

          <div class="vacina-title">
            ${vacinaNome}
          </div>

          <div class="delete">
            ✖
          </div>

        </div>

        <div class="vacina-bottom">

          <input 
            type="text"
            class="date-input"
            placeholder="00/00/0000"
            maxlength="10"
          >

          <label class="check-area">

            <input 
              type="checkbox"
              class="checkbox"
            >

            Não lembro

          </label>

        </div>

      `;

      vacinasContainer.appendChild(card);

      dropdown.classList.remove("active");


      // REMOVER CARD

      const deleteButton = card.querySelector(".delete");

      deleteButton.addEventListener("click", () => {
        card.remove();
      });


      // CHECKBOX NÃO LEMBRO

      const checkbox = card.querySelector(".checkbox");
      const input = card.querySelector(".date-input");

      checkbox.addEventListener("change", () => {

        if(checkbox.checked){
          input.disabled = true;
          input.value = "";
          input.placeholder = "Não informado";
          input.style.opacity = ".5";
        }
        else{
          input.disabled = false;
          input.placeholder = "00/00/0000";
          input.style.opacity = "1";
        }

      });


      // ACEITAR APENAS NÚMEROS + FORMATAR DATA

      input.addEventListener("input", (e) => {

        let valor = e.target.value;

        // remove tudo que não for número
        valor = valor.replace(/\D/g, "");

        // adiciona /
        if(valor.length > 2){
          valor = valor.slice(0,2) + "/" + valor.slice(2);
        }

        if(valor.length > 5){
          valor = valor.slice(0,5) + "/" + valor.slice(5,9);
        }

        e.target.value = valor;

      });

    });

  });


  // FOOTER

  document.querySelector(".voltar")
    .addEventListener("click", () => {
      alert("Voltar");
    });

  document.querySelector(".avancar")
    .addEventListener("click", () => {
      alert("Avançar");
    });