require('dotenv').config();

const LOGO_URL = 'https://i.imgur.com/gjDINnJ.png';

function getFromAddress() {
  return process.env.FROM_EMAIL;
}

async function sendMailSafe(options) {
  try {
    const respuesta = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'ARA Shipping',
          email: getFromAddress()
        },
        to: [
          {
            email: options.to
          }
        ],
        subject: options.subject,
        htmlContent: options.html
      })
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        `Brevo API ${respuesta.status}: ${JSON.stringify(data)}`
      );
    }

    console.log('✅ Correo enviado con Brevo API:', data.messageId);

    return data;

  } catch (error) {
    console.error(
      '❌ Error enviando correo con Brevo API:',
      error.message
    );

    throw error;
  }
}

async function verificarSMTP() {
  console.log('✅ Brevo API configurada');
  return true;
}


// ======================================================
// 1. ACTUALIZACIÓN DE TRACKING
// ======================================================

async function enviarCorreoActualizacion(
  para,
  numeroTracking,
  nuevoEstado
) {
  return sendMailSafe({
    to: para,

    subject: `🧾 Estado actualizado de tu envío: ${numeroTracking}`,

    html: `
      <div style="font-family: Arial, sans-serif; background: #f6f9fc; padding: 30px;">
        <div style="
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        ">

          <div style="text-align: center; margin-bottom: 20px;">
            <img
              src="${LOGO_URL}"
              alt="ARA Shipping Logo"
              style="max-width: 120px; margin-bottom: 10px;"
            >

            <h1 style="color: #2c4e70; margin: 0;">
              ARA Shipping
            </h1>
          </div>

          <h2 style="color: #2c3e50;">
            Estado actualizado de tu envío
          </h2>

          <p>Hola,</p>

          <p>
            El estado de tu paquete con número
            <strong>${numeroTracking}</strong>
            ha sido actualizado a:
          </p>

          <p style="font-size: 18px; color: #27ae60;">
            <strong>${nuevoEstado}</strong>
          </p>

          <hr style="margin: 20px 0;">

          <p>Gracias por confiar en nosotros.</p>

          <p style="font-size: 12px; color: #999;">
            Este es un mensaje automático.
            No respondas a este correo.
          </p>

        </div>
      </div>
    `
  });
}


// ======================================================
// 2. BIENVENIDA
// ======================================================

async function enviarCorreoBienvenida(
  para,
  nombre
) {
  return sendMailSafe({
    to: para,

    subject: '🎉 ¡Bienvenido(a) a ARA Shipping Global Solutions!',

    html: `
      <div style="font-family: Arial, sans-serif; background: #f6f9fc; padding: 30px;">
        <div style="
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        ">

          <div style="text-align: center; margin-bottom: 20px;">
            <img
              src="${LOGO_URL}"
              alt="ARA Shipping Logo"
              style="max-width: 120px; margin-bottom: 10px;"
            >

            <h1 style="color: #2c4e70; margin: 0;">
              ARA Shipping
            </h1>
          </div>

          <h2 style="color: #2c3e50;">
            ¡Hola ${nombre}!
          </h2>

          <p>
            Gracias por registrarte en
            <strong>ARA Shipping Global Solutions</strong>.
          </p>

          <p>
            Ahora podés hacer seguimiento de tus paquetes,
            gestionar tus envíos y mucho más desde tu cuenta.
          </p>

          <p style="margin-top: 20px;">
            📦 Estamos aquí para ayudarte a llevar tus paquetes
            al destino correcto.
          </p>

          <hr style="margin: 20px 0;">

          <p style="font-size: 12px; color: #999;">
            Este mensaje es automático.
            No respondas a este correo.
          </p>

        </div>
      </div>
    `
  });
}


// ======================================================
// 3. CÓDIGO DE RECUPERACIÓN
// ======================================================

async function enviarCodigoRecuperacion(
  para,
  nombre,
  codigo
) {
  return sendMailSafe({
    to: para,

    subject: '🔐 Código de recuperación de contraseña',

    html: `
      <div style="font-family: Arial, sans-serif; background: #f6f9fc; padding: 40px;">
        <div style="
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          padding: 30px;
        ">

          <div style="text-align: center; margin-bottom: 30px;">
            <img
              src="${LOGO_URL}"
              alt="ARA Shipping Logo"
              style="max-width: 120px; margin-bottom: 10px;"
            >

            <h1 style="color: #2c4e70; margin: 0;">
              ARA Shipping
            </h1>
          </div>

          <h2 style="color: #2c4e70;">
            Hola ${nombre},
          </h2>

          <p style="font-size: 16px; color: #333;">
            Recibimos una solicitud para restablecer tu contraseña.
          </p>

          <p style="font-size: 16px; color: #333;">
            Tu <strong>código de recuperación</strong> es:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <span style="
              font-size: 32px;
              color: #e74c3c;
              font-weight: bold;
              letter-spacing: 4px;
            ">
              ${codigo}
            </span>
          </div>

          <p style="font-size: 14px; color: #555;">
            Este código es válido por un tiempo limitado.
            Ingresalo en la plataforma para continuar con el proceso.
          </p>

          <hr style="
            border: none;
            border-top: 1px solid #ddd;
            margin: 30px 0;
          ">

          <p style="
            font-size: 12px;
            color: #999;
            text-align: center;
          ">
            Si no solicitaste restablecer tu contraseña,
            podés ignorar este mensaje.
          </p>

        </div>
      </div>
    `
  });
}


// ======================================================
// 4. CONFIRMACIÓN DE CAMBIO DE CONTRASEÑA
// ======================================================

async function enviarConfirmacionCambioClave(
  para,
  nombre
) {
  return sendMailSafe({
    to: para,

    subject: '🔒 Tu contraseña se actualizó correctamente',

    html: `
      <div style="font-family: Arial, sans-serif; background: #f6f9fc; padding: 40px;">
        <div style="
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          padding: 30px;
        ">

          <div style="text-align: center; margin-bottom: 30px;">
            <img
              src="${LOGO_URL}"
              alt="ARA Shipping Logo"
              style="max-width: 120px; margin-bottom: 10px;"
            >

            <h1 style="color: #2c4e70; margin: 0;">
              ARA Shipping
            </h1>
          </div>

          <h2 style="color: #2c4e70;">
            Hola ${nombre},
          </h2>

          <p style="font-size: 16px; color: #333;">
            Confirmamos que tu contraseña fue actualizada correctamente.
          </p>

          <p style="
            font-size: 14px;
            color: #555;
            margin-top: 20px;
          ">
            Si no fuiste vos quien cambió la contraseña,
            contactanos de inmediato.
          </p>

          <hr style="
            border: none;
            border-top: 1px solid #ddd;
            margin: 30px 0;
          ">

          <p style="
            font-size: 12px;
            color: #999;
            text-align: center;
          ">
            Este mensaje es automático.
            No respondas a este correo.
          </p>

        </div>
      </div>
    `
  });
}


// ======================================================
// 5. NUEVO TRACKING
// ======================================================

async function enviarCorreoNuevoTracking(
  para,
  nombre,
  numeroTracking
) {
  return sendMailSafe({
    to: para,

    subject: '📦 Tu envío ha sido registrado correctamente',

    html: `
      <div style="font-family: Arial, sans-serif; background: #f6f9fc; padding: 40px;">
        <div style="
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          padding: 30px;
        ">

          <div style="text-align: center; margin-bottom: 30px;">
            <img
              src="${LOGO_URL}"
              alt="ARA Shipping Logo"
              style="max-width: 120px; margin-bottom: 10px;"
            >

            <h1 style="color: #2c4e70; margin: 0;">
              ARA Shipping
            </h1>
          </div>

          <h2 style="color: #2c4e70;">
            Hola ${nombre},
          </h2>

          <p style="font-size: 16px; color: #333;">
            Te confirmamos que hemos registrado
            un nuevo envío a tu nombre.
          </p>

          <p>
            El número de tracking es:
          </p>

          <div style="text-align: center; margin: 20px 0;">
            <span style="
              font-size: 26px;
              color: #34495e;
              font-weight: bold;
            ">
              ${numeroTracking}
            </span>
          </div>

          <p style="
            font-size: 12px;
            color: #999;
            text-align: center;
          ">
            Este mensaje es automático.
            No respondas a este correo.
          </p>

        </div>
      </div>
    `
  });
}


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  verificarSMTP,
  enviarCorreoActualizacion,
  enviarCorreoBienvenida,
  enviarCodigoRecuperacion,
  enviarConfirmacionCambioClave,
  enviarCorreoNuevoTracking
};
