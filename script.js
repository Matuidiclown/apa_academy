// ==================== CATÁLOGO DINÁMICO CONECTADO A MYSQL ====================
let cursosDesdeBD = [];

// Asignar ícono visual según el nombre del curso
function obtenerIconoCurso(nombre) {
  const n = nombre.toLowerCase();
  if (n.includes("excel")) return "X";
  if (n.includes("power bi")) return "📊";
  if (n.includes("office")) return "📄";
  if (n.includes("r ") || n === "r" || n.includes("estadística")) return "R";
  if (n.includes("automatiz")) return "⚡";
  if (n.includes("ulima")) return "UL";
  if (n.includes("upc")) return "UPC";
  if (n.includes("udep") || n.includes("pacífico")) return "UDEP";
  if (n.includes("utec")) return "UTEC";
  if (n.includes("taa") || n.includes("becas")) return "TAA";
  return "📘";
}

// Cargar cursos en tiempo real desde crud_cursos.php (MySQL)
function cargarCursosDesdeMySQL(mostrarAviso = false) {
  $.getJSON("crud_cursos.php")
    .done(function (data) {
      cursosDesdeBD = $.map(data, function (row) {
        const cats = (row.categorias || "").toLowerCase();
        // Detectar si pertenece al bloque Universitario/Pre o al Técnico
        const esUniversitario =
          cats.includes("universit") ||
          cats.includes("pre-univ") ||
          row.nombre.toLowerCase().includes("ulima") ||
          row.nombre.toLowerCase().includes("upc") ||
          row.nombre.toLowerCase().includes("taa");

        return {
          id_curso: Number(row.id_curso),
          nombre: row.nombre,
          precio: Number(row.precio),
          categorias: row.categorias || "General",
          subtitulo: `Categorías: ${row.categorias || "Programa Académico APE"}`,
          icono: obtenerIconoCurso(row.nombre),
          bloque: esUniversitario ? "pre-univ" : "tecnico",
          destacado: Number(row.id_curso) <= 2
        };
      });

      actualizarComboBoxHeader();
      renderizarCatalogoTecnico($('input[name="toolRadio"]:checked').val() || "all");
      renderizarCatalogoUniversitario($("[data-unifilter].active").attr("data-unifilter") || "all");

      if (mostrarAviso) {
        mostrarToastSimple("🔄 Catálogo sincronizado con MySQL (" + cursosDesdeBD.length + " cursos)");
      }
    })
    .fail(function () {
      mostrarToastSimple("⚠️ Error al conectar con crud_cursos.php. Verifica que php -S esté activo.");
    });
}

// Actualizar dinámicamente el Combo Box superior con los cursos de la BD
function actualizarComboBoxHeader() {
  const $select = $("#academicBlockSelect");
  $select.find("optgroup").empty();

  const $grupoUni = $select.find('optgroup').eq(0);
  const $grupoTec = $select.find('optgroup').eq(1);

  $.each(cursosDesdeBD, function (i, c) {
    const opcion = `<option value="${c.bloque}|id:${c.id_curso}">${c.nombre} (US$ ${c.precio.toFixed(2)})</option>`;
    if (c.bloque === "pre-univ") {
      $grupoUni.append(opcion);
    } else {
      $grupoTec.append(opcion);
    }
  });
}

// ==================== ESTADO DEL CARRITO CON CANTIDADES ====================
let carrito = [];
let toastTimer = null;

function obtenerTotalUnidades() {
  let totalUnidades = 0;
  $.each(carrito, function (i, item) {
    totalUnidades += item.cantidad;
  });
  return totalUnidades;
}

function renderizarCarrito() {
  const $lista = $("#checkoutItemsList").empty();
  let sumaTotal = 0;

  $("#cartBadge").text(obtenerTotalUnidades());

  if (carrito.length === 0) {
    $lista.append(`
      <p style="padding: 1.2rem 0; color: #5a657d; text-align: center;">
        Tu carrito está vacío. Explora nuestros bloques académicos para agregar cursos.
      </p>
    `);
    $("#checkoutTotalAmount").text("US$: 0.00");
    return;
  }

  $.each(carrito, function (index, item) {
    const subtotalItem = Number(item.precio) * item.cantidad;
    sumaTotal += subtotalItem;

    const $fila = $(`
      <div class="order-item">
        <div class="item-thumb">${item.icono}</div>
        <div class="item-details">
          <strong>${item.nombre}</strong>
          <span>US$ ${Number(item.precio).toFixed(2)} c/u · Virtual en Vivo</span>
          <div class="qty-controls">
            <button type="button" class="btn-qty" data-action="restar" data-index="${index}">−</button>
            <span class="qty-number">${item.cantidad} paq.</span>
            <button type="button" class="btn-qty" data-action="sumar" data-index="${index}">+</button>
          </div>
        </div>
        <button type="button" class="item-trash" data-index="${index}" title="Eliminar paquete">🗑️</button>
        <span class="item-price">US$ ${subtotalItem.toFixed(2)}</span>
      </div>
    `);

    $lista.append($fila);
  });

  $("#checkoutTotalAmount").text(`US$: ${sumaTotal.toFixed(2)}`);
}

function mostrarToastSimple(mensaje) {
  let $contenedor = $("#toastContainer");
  if ($contenedor.length === 0) {
    $contenedor = $('<div id="toastContainer" class="toast-container"></div>');
    $("body").append($contenedor);
  }
  $contenedor.empty();
  const $toast = $(`<div class="cart-toast"><div class="toast-title">${mensaje}</div></div>`);
  $contenedor.append($toast);
  $toast.fadeIn(200);
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $toast.fadeOut(300, () => $toast.remove()), 3500);
}

function mostrarNotificacionCarrito(itemActual) {
  let $contenedor = $("#toastContainer");
  if ($contenedor.length === 0) {
    $contenedor = $('<div id="toastContainer" class="toast-container"></div>');
    $("body").append($contenedor);
  }

  $contenedor.empty();

  const $toast = $(`
    <div class="cart-toast" style="display: none;">
      <div class="toast-header">
        <div>
          <div class="toast-title">✅ ¡Añadiste 1 paquete de "${itemActual.nombre}"!</div>
          <div class="toast-sub">Llevas <strong>${itemActual.cantidad}</strong> unidad(es) en tu carrito.</div>
        </div>
      </div>
      <div class="toast-actions">
        <button type="button" class="btn-toast-more" data-id="${itemActual.id_curso}" data-nombre="${itemActual.nombre}" data-precio="${itemActual.precio}">
          + Agregar 1 más
        </button>
        <button type="button" class="btn-toast-checkout" data-view="checkout">
          Ir al carrito (${obtenerTotalUnidades()}) →
        </button>
      </div>
    </div>
  `);

  $contenedor.append($toast);
  $toast.fadeIn(220);

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    $toast.fadeOut(300, function () {
      $(this).remove();
    });
  }, 4500);
}

function seleccionarCursoParaCheckout(nombreCurso, precio, idCurso = 1) {
  let itemEncontrado = null;

  $.each(carrito, function (i, item) {
    if (item.nombre === nombreCurso) {
      item.cantidad += 1;
      itemEncontrado = item;
      return false;
    }
  });

  if (!itemEncontrado) {
    itemEncontrado = {
      id_curso: Number(idCurso),
      nombre: nombreCurso,
      precio: Number(precio),
      icono: obtenerIconoCurso(nombreCurso),
      cantidad: 1
    };
    carrito.push(itemEncontrado);
  }

  renderizarCarrito();
  mostrarNotificacionCarrito(itemEncontrado);
}

// Cambiar entre las vistas principales
function cambiarVista(vistaId) {
  $(".view-section").removeClass("active");
  $(`#view-${vistaId}`).addClass("active");

  $(".nav-item").removeClass("active");
  $(`.nav-item[data-view="${vistaId}"]`).addClass("active");

  // Refrescar automáticamente desde MySQL al entrar a cualquier catálogo
  if (vistaId === "tecnico" || vistaId === "pre-univ") {
    cargarCursosDesdeMySQL(false);
  }

  $("html, body").animate({ scrollTop: 0 }, 300);
}

// Renderizar tarjetas del catálogo Técnico desde MySQL
function renderizarCatalogoTecnico(filtro = "all") {
  const $topGrid = $("#techTopGrid").empty();
  const $bottomGrid = $("#techBottomGrid").empty();

  const cursosTec = $.grep(cursosDesdeBD, function (c) {
    if (c.bloque !== "tecnico") return false;
    if (filtro === "all") return true;
    if (filtro.startsWith("id:")) return c.id_curso === Number(filtro.split(":")[1]);
    return c.nombre.toLowerCase().includes(filtro.toLowerCase());
  });

  if (cursosTec.length === 0) {
    $bottomGrid.append(`<p style="color:#5a657d;">No hay cursos técnicos para este filtro.</p>`);
    return;
  }

  $.each(cursosTec, function (index, curso) {
    const $card = $(`
      <article class="tech-card">
        <div>
          <div class="tech-card-header">
            <div class="tech-icon-box">${curso.icono}</div>
            <div>
              <h3>${curso.nombre}</h3>
              <small style="color: #ff9000; font-weight: 700;">US$ ${curso.precio.toFixed(2)} · ID #${curso.id_curso}</small>
            </div>
          </div>
          <p style="margin-top: 0.85rem;">${curso.subtitulo}</p>
        </div>
        <div class="tech-card-actions">
          <button class="btn-detail" 
            data-id="${curso.id_curso}"
            data-nombre="${curso.nombre}" 
            data-subtitulo="${curso.subtitulo}" 
            data-precio="${curso.precio}" 
            data-categoria="${curso.categorias}">
            Detalle
          </button>
          <button class="btn-cart" 
            data-id="${curso.id_curso}"
            data-nombre="${curso.nombre}" 
            data-precio="${curso.precio}">
            + Carrito
          </button>
        </div>
      </article>
    `);

    if (curso.destacado && filtro === "all") {
      $topGrid.append($card);
    } else {
      $bottomGrid.append($card);
    }
  });
}

// Renderizar cursos Pre-Univ / Universitarios desde MySQL
function renderizarCatalogoUniversitario(filtroUni = "all") {
  const $grid = $("#uniCoursesGrid").empty();

  const filtrados = $.grep(cursosDesdeBD, function (u) {
    if (u.bloque !== "pre-univ") return false;
    if (filtroUni === "all") return true;
    if (filtroUni.startsWith("id:")) return u.id_curso === Number(filtroUni.split(":")[1]);
    return u.nombre.toLowerCase().includes(filtroUni.toLowerCase());
  });

  if (filtrados.length === 0) {
    $grid.append(`<p style="color:#5a657d;">No hay programas universitarios registrados para este filtro.</p>`);
    return;
  }

  $.each(filtrados, function (index, item) {
    const $card = $(`
      <article class="tech-card">
        <div>
          <div class="tech-card-header">
            <div class="tech-icon-box">${item.icono}</div>
            <div>
              <h3>${item.nombre}</h3>
              <small style="color: #ff9000; font-weight: 700;">US$ ${item.precio.toFixed(2)} · ID #${item.id_curso}</small>
            </div>
          </div>
          <p style="margin-top: 0.85rem;">${item.subtitulo}</p>
        </div>
        <div class="tech-card-actions">
          <button class="btn-detail" 
            data-id="${item.id_curso}"
            data-nombre="${item.nombre}" 
            data-subtitulo="${item.subtitulo}" 
            data-precio="${item.precio}" 
            data-categoria="${item.categorias}">
            Detalle
          </button>
          <button class="btn-cart" 
            data-id="${item.id_curso}"
            data-nombre="${item.nombre}" 
            data-precio="${item.precio}">
            + Carrito
          </button>
        </div>
      </article>
    `);

    $grid.append($card);
  });
}

function abrirModalDetalle(idCurso, titulo, desc, precio, categoria) {
  $("#modalTitle").text(titulo);
  $("#modalDesc").text(desc);
  $("#modalPrice").text(`US$ ${Number(precio).toFixed(2)}`);
  $("#modalCategory").text(categoria);

  $("#modalAddBtn").text("+ Añadir al Carrito").data({
    id: idCurso,
    nombre: titulo,
    precio: precio
  });

  $("#courseModal").addClass("open");
}

// ==================== INICIALIZACIÓN JQUERY ====================
$(document).ready(function () {
  // Inyectar botón de sincronización rápida en el header para demostraciones con Postman
  $(".nav-actions").prepend(`
    <button type="button" id="syncBdBtn" class="btn-cart-pill" title="Recargar datos de MySQL">
      🔄 Sincronizar BD
    </button>
  `);

  // Cargar los cursos reales desde MySQL al abrir la web
  cargarCursosDesdeMySQL(false);
  renderizarCarrito();

  $("#syncBdBtn").on("click", function () {
    cargarCursosDesdeMySQL(true);
  });

  $(document).on("click", "[data-view]", function (e) {
    e.preventDefault();
    cambiarVista($(this).attr("data-view"));
  });

  $(document).on("click", ".btn-detail", function () {
    const $btn = $(this);
    abrirModalDetalle(
      $btn.data("id"),
      $btn.data("nombre"),
      $btn.data("subtitulo"),
      $btn.data("precio"),
      $btn.data("categoria")
    );
  });

  $(document).on("click", ".btn-cart", function () {
    const $btn = $(this);
    seleccionarCursoParaCheckout($btn.data("nombre"), $btn.data("precio"), $btn.data("id"));
  });

  $(document).on("click", ".btn-toast-more", function () {
    const $btn = $(this);
    seleccionarCursoParaCheckout($btn.data("nombre"), $btn.data("precio"), $btn.data("id"));
  });

  $("#modalAddBtn").on("click", function () {
    const datos = $(this).data();
    $("#courseModal").removeClass("open");
    seleccionarCursoParaCheckout(datos.nombre, datos.precio, datos.id);
  });

  $(document).on("click", ".btn-qty", function () {
    const index = $(this).data("index");
    const accion = $(this).data("action");

    if (accion === "sumar") {
      carrito[index].cantidad += 1;
    } else if (accion === "restar") {
      if (carrito[index].cantidad > 1) {
        carrito[index].cantidad -= 1;
      } else {
        carrito.splice(index, 1);
      }
    }
    renderizarCarrito();
  });

  $("#closeModalBtn").on("click", function () {
    $("#courseModal").removeClass("open");
  });

  $("#academicBlockSelect").on("change", function () {
    const partes = $(this).val().split("|");
    const vista = partes[0];
    const filtro = partes[1];

    cambiarVista(vista);

    if (vista === "tecnico") {
      renderizarCatalogoTecnico(filtro);
    } else if (vista === "pre-univ") {
      renderizarCatalogoUniversitario(filtro);
    }
  });

  $("#heroGoBtn").on("click", function () {
    cambiarVista($("#heroComboSelect").val());
  });

  $('input[name="toolRadio"]').on("change", function () {
    renderizarCatalogoTecnico($(this).val());
  });

  $("[data-unifilter]").on("click", function () {
    const $chip = $(this);
    $("[data-unifilter]").removeClass("active");
    $chip.addClass("active");
    renderizarCatalogoUniversitario($chip.attr("data-unifilter"));
  });

  $(".pay-method-btn").on("click", function () {
    $(".pay-method-btn").removeClass("active");
    $(this).addClass("active");
  });

  $(document).on("click", ".item-trash", function () {
    const indexEliminar = $(this).data("index");
    $(this).closest(".order-item").fadeOut(200, function () {
      carrito.splice(indexEliminar, 1);
      renderizarCarrito();
    });
  });

  // Guardar el pedido REAL en MySQL (PEDIDOS y DETALLE_PEDIDO) al confirmar el pago
  $("#paymentForm").on("submit", function (e) {
    e.preventDefault();
    if (carrito.length === 0) {
      alert("Por favor, agrega al menos un curso al carrito antes de proceder al pago.");
      return;
    }

    let totalPagar = 0;
    const detalles = [];
    $.each(carrito, function (i, item) {
      totalPagar += item.precio * item.cantidad;
      for (let k = 0; k < item.cantidad; k++) {
        detalles.push({
          id_curso: item.id_curso,
          precio_unitario: item.precio
        });
      }
    });

    const payload = {
      id_usuario: 1,
      total: totalPagar,
      metodo_pago: $(".pay-method-btn.active").text().trim(),
      detalles: detalles
    };

    $.ajax({
      url: "crud_pedidos.php",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
      success: function (res) {
        alert("✅ ¡Pago registrado en MySQL! Pedido #" + res.id_pedido + " guardado en PEDIDOS y DETALLE_PEDIDO.");
        carrito = [];
        renderizarCarrito();
      },
      error: function () {
        alert("⚠️ No se pudo guardar el pedido en crud_pedidos.php.");
      }
    });
  });
});