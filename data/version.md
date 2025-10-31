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
🚧 Se trabaja en parametrizar conversaciones <br>
💭 Se busca loguear conversaciones ❓(pensar solución para clientes; cómo registramos a los usuarios)<br>
🎁 <strong> Se presenta el proyecto </strong><br><br>
<b>💬 Nota final</b>



🎯 Recommended Evaluation Categories<br>
The insights that brings the tool are important, but much more important are the ideas thar flowers from individual mind<br>
Based on recruitment best practices and your chatbot's purpose, here are 5 key categories to evaluate:<br><br>
1. CULTURAL_ALIGNMENT 🤝<br>
Measures: Interés en valores de la empresa, ambiente laboral, dinámica de equipo, cultura organizacional, colaboración, misión, visión, principios éticos, ambiente de trabajo, relaciones interpersonales, valores corporativos<br>
Keywords: "culture", "values", "team", "collaboration", "environment", "mission"<br>
Scoring: Questions about company culture vs. just job requirements<br>
2. GROWTH_MINDSET 📈<br>
Measures:  Interés en aprendizaje, desarrollo profesional, crecimiento personal, oportunidades de capacitación, mentoría, formación, progreso de carrera, mejora continua, adquisición de habilidades, desarrollo de competencias<br>
Keywords: "learn", "develop", "growth", "opportunity", "training", "mentorship"<br>
Scoring: Questions about personal development and learning opportunities<br>
3. ENGAGEMENT_DEPTH 💬<br>
Measures: Profundidad de preguntas, calidad de seguimiento, nivel de curiosidad, detalle en las consultas, interés genuino, interacción significativa, exploración exhaustiva, comprensión profunda, diálogo constructivo<br>
Keywords: Follow-up patterns, question complexity, conversation length<br>
Scoring: Number of meaningful follow-ups, conversation depth<br>
4. ROLE_UNDERSTANDING 🎯<br>
Measures: Claridad sobre responsabilidades, expectativas del rol, alcance del puesto, entregables esperados, criterios de éxito, objetivos del cargo, funciones principales, competencias requeridas, impacto del rol<br>
Keywords: "responsibilities", "expectations", "scope", "deliverables", "success"<br>
Scoring: How well they understand what the role actually involves<br>
5. STRATEGIC_THINKING 🧠<br>
Measures: Comprensión de impacto empresarial, visión a largo plazo, enfoque estratégico, resolución de problemas, objetivos organizacionales, desafíos del negocio, soluciones innovadoras, mejora de procesos, pensamiento sistémico<br>
Keywords: "impact", "strategy", "goals", "challenges", "solutions", "improvement"<br>
Scoring: Questions about business context, not just role execution<br><br>

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
