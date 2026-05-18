    const optionButtons = document.querySelectorAll(".btn-option");
    const dropdownBtn = document.getElementById("toggleDropdown");
    const dropdown = document.getElementById("dropdown");
    const items = document.querySelectorAll(".dropdown-item");
    const container = document.getElementById("medicacoesContainer");

    // TROCAR BOTÃO ATIVO
    optionButtons.forEach(button => {

      button.addEventListener("click", () => {

        optionButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        // MOSTRAR DROPDOWN SOMENTE NO "SIM"
        if(button.textContent === "Sim"){
          dropdownBtn.style.display = "flex";
        }else{
          dropdownBtn.style.display = "none";
          dropdown.style.display = "none";
        }

      });

    });

    // ABRIR DROPDOWN
    dropdownBtn.addEventListener("click", () => {

      if(dropdown.style.display === "flex"){
        dropdown.style.display = "none";
      }else{
        dropdown.style.display = "flex";
      }

    });

    // ADICIONAR MEDICAÇÃO
    items.forEach(item => {

      item.addEventListener("click", () => {

        const nome = item.textContent.trim();

        // EVITAR DUPLICAÇÃO
        const existe = [...document.querySelectorAll(".medicacao-tag")]
          .some(tag => tag.dataset.nome === nome);

        if(existe) return;

        item.classList.add("selected");

        const tag = document.createElement("div");
        tag.classList.add("medicacao-tag");
        tag.dataset.nome = nome;

        tag.innerHTML = `
          ${nome}
          <span class="remove">×</span>
        `;

        container.appendChild(tag);

        // REMOVER TAG
        tag.querySelector(".remove").addEventListener("click", () => {

          tag.remove();
          item.classList.remove("selected");

        });

      });

    });