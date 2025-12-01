<b><big> ✒️ CHAT-SCREENING</b></big>

<b>💡 Roadmap del proyecto </b>

Chat-Screening es un chatbot diseñado para representar a una vacante en formato conversacional.
Permite que candidatos interactúen con el rol, conozcan sus desafíos y hagan preguntas, mientras la organización evalúa: nivel de preparación, calidad de las preguntas, conexión con la cultura, y lectura estratégica del desafío.
En vez de solo leer un CV, la empresa obtiene señales del potencial y la disposición a crecer de cada persona.

<b>🎯 Génesis del proyecto</b><br>
✅ Se comienza a trabajar en el Proyecto'ChatCV' desde 🔗n8n 📅6 AGO. 2025<br>
✅ Se entrega el proyecto 'ChatCV' 📅12 AGO. 2025<br>
✅ Al socializarlo, un referente del ecosistema HR me pregunta <strong>✨¿Y si inviertes el enfoque entre el candidato y la empresa?</strong>📅 25 SEP. 2025<br><br>
<b>🎯 Control de versiones</b><br>
✅ <strong>Se crea un 🐈‍⬛GH repo con el frontend del chat-screening 📅26 SEP. 2025</strong><br>
✅ <strong>El chatbot cobra vida:</strong> Se logra conectar el chatbot con el frontend 📅29 SEP. 2025<br>
✅ Se logra adaptar el chatbot a la vacante📅30 SEP. 2025<br>
✅ Se logra hacer funcionar el chat con modelo embedding 📅22 OCT. 2025<br>
✅ <strong>El chatbot aprende a contextualizar de forma inteligente:</strong> Se logra adaptar el chat a la vacante (c/ embedding)  📅23 OCT. 2025<br><br>
💭 <strong>Comienza el desafío de potenciar con data analytics:</strong> ✨¿Será posible evaluar el potencial del candidato según su interacción con la plataforma?<br>
✅ Definir categoría y criterio de evaluación 📅23 OCT. 2025<br>
<strong> ✨ 500 COMMITS ✨</strong><br>
✅ Se logra en crear un frontend para la analítica de datos 📅26 OCT. 2025<br>
✅ Se logra conectar el dashboard con el backend 📅28 OCT. 2025<br> 
✅ Se logra configurar base de datos en ⚡Supabase 📅29 OCT. 2025<br> 
✅ Se diseña un ruleset que parametriza las interacciones con el chatbot 📅30 OCT. 2025<br>
🔧 Reparación PC + UpGrade RAM❗ 📅18 NOV. 2025<br> 
✅ Se logran parametrizar conversaciones según ruleset creado 📅01 DIC. 2025<br>
💭 Se busca loguear conversaciones ❓(pensar solución para clientes; cómo registramos a los usuarios)<br>
🎁 <strong> Se presenta el proyecto </strong><br><br>
<b>💬 Nota final</b>

<b> 🏴‍☠️ Bitácora de Cagazos </b><br>
🤦🏻‍♂️ Me demoraba entre 15 y 90 min em prender el pc todos los días | El cargador de mi pc era pirata, me tuve que comprar el original 📅 10 NOV. 2025 <br>
🤦🏻‍♂️ Integré n8n, github, supabase y cursor con una capacidad inicial de 4 ram | Escalé a una RAM de 8 GB. 📅 17 NOV. 2025 <br>
🤦🏻‍♂️ La RAM que compré por PC Factory no era para mi pc | La pude devolver y conseguí por otro lado una SODIMM + instalación 📅 17 NOV. 2025 <br>
🤦🏻‍♂️ Mi n8n workflow no conectaba con el front | Me agoté la suscripción de n8n anticipadamente por activar un trigger cada 5 min 📅 18 NOV. 2025 <br>


<strong>💯Scoring ruleset:💯</strong><br>
- An interaction is 1 question + 1 answer<br>
- The scoring scale for candidates goes from 1 to 5<br>
- both questions and answers add scoring to the interaction<br>
- In a single interaction, keywords on questions weight 3 times more than keywords in answers<br> 
- In 1 interaction, a single prompt could add score in more than 1 dimension<br>
- In 1 interaction, an answer could add score in more than 1 dimension<br>
- Scoring is measured in 5 dimensions: 'Cultural', 'Crecimiento', 'Engagement', 'Rol', Estrategico'<br>
- Each new interaction gives more posibilities to the usser to get a higher scoring<br>
- A candidate can never lose score, allways adding<br>
- Full scoring candidates are the ones who reach a whole context in all dimensions<br>
- Ussers who achieve best averaged scoring and more number of interactions, have more chances to get considered as high potential candidates<br>
