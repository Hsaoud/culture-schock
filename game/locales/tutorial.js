const source=`Your first conquest|Your training uses the real controls. Try every power: your campaign will be waiting, untouched.|Begin
Aim at another country|Tap a country on the map or choose one in the Atlas. The territory arrows also work with a controller.|Open the Atlas
Send your ambassador|Press Send. Watch the journey: the country gains 12% influence. The button then shows its cooldown.
Fill up|Collect the four sparks on the map or press Collect. Flame: traditions. Bolt: actions. Crown: defence. Bulb: faster research.
Get people talking|Use Persuade: +24% influence and +4 outrage. Watch both gauges change.
Settle in for good|Establish an outpost. It accelerates local growth without sending another ambassador every day.
Awaken a tradition|Open the Workshop: traditions for influence, cultural reach for spreading, guardians for protection.
Begin spreading your culture|Choose the highlighted first level of Cultural reach. Each branch unlocks in order.|Open the Workshop
Ideas take time|Watch the progress. Brainpower speeds up work without being spent. Time runs at 4× here.
Sabotage approaching!|Follow the red route to your sanctuary. Intercept before impact. At 23% outrage, the coalition starts preparing attacks.
Protect your emblem|A demonstration impact damaged it. Use Restore to recover 28 points. At zero integrity, the campaign is lost.
Ease the tension|Use Soothe and watch outrage drop by 12 points: less tension means fewer sabotages.
Your decision|Choose a response. Symbols show gains and costs; your traditions’ purity may also fall temporarily.
Time to think|Pause with Ⅱ, Space or Start. You can still choose actions while paused.
Restart time|Press the same button again to resume.
Speed up your conquest|Press 1× to switch to 2×, then to 4×. Outrage and attacks also advance faster!
Explore the world|Zoom with +, the wheel, a pinch or the triggers. Drag the map or use the right stick. ◎ restores the world view.
Write your own legend|Culture spreads over time. Reach 100% in all 236 territories while protecting your emblem. Training has cost your campaign nothing.|Play my campaign`;
const chinese=`你的第一次征服|训练使用真实操作。尝试所有能力吧：你的战役会原封不动地等着你。|开始
瞄准另一个国家|点击地图上的国家，或在图集中选择。地区箭头也支持手柄。|打开图集
派出你的使者|按下“派遣”。观察旅程：该国影响力增加 12%。按钮随后显示冷却时间。
补充资源|收集地图上的四个光点，或按“收集”。火焰：传统。闪电：行动。王冠：防御。灯泡：加速研究。
让大家谈论你|使用“说服”：影响力 +24%，愤怒值 +4。观察两个计量条的变化。
长久扎根|建立一个据点。它能加快当地增长，无需每天重新派遣使者。
唤醒传统|打开工坊：传统增强影响力，文化辐射促进扩散，守卫负责防御。
开始文化传播|选择高亮的文化辐射第一级。每个分支均按顺序解锁。|打开工坊
创意需要时间|观察进度。脑力能加速研究，且不会被消耗。此处时间以 4× 推进。
破坏来袭！|沿红色路线找到来袭目标，在命中圣所前拦截。愤怒值达到 23% 后，联盟会准备攻击。
保护你的徽章|示范攻击损坏了徽章。使用“修复”恢复 28 点。完整度归零则战役失败。
缓解紧张局势|使用“安抚”，观察愤怒值降低 12 点。紧张越少，破坏越少。
由你决定|选择一种应对。符号显示收益与花费，传统纯正度也可能暂时降低。
留出思考时间|使用 Ⅱ、空格或 Start 暂停。暂停期间仍可选择行动。
重新启动时间|再次按下同一按钮继续。
加快征服|按 1× 切换到 2×，再按一次到 4×。愤怒和攻击也会更快推进！
探索世界|用 +、滚轮、双指捏合或扳机缩放。拖动地图或使用右摇杆。◎ 恢复全球视图。
书写你的传奇|文化随时间传播。在守护徽章的同时，让全部 236 个地区达到 100%。训练不会消耗战役资源。|开始我的战役`;
const italian=`La tua prima conquista|L’allenamento usa i veri comandi. Prova ogni potere: la tua campagna ti aspetta intatta.|Inizia
Punta a un altro paese|Tocca un paese sulla mappa o sceglilo nell’Atlante. Le frecce dei territori funzionano anche col controller.|Apri l’Atlante
Invia il tuo ambasciatore|Premi Invia. Segui il viaggio: il paese guadagna il 12% d’influenza. Il pulsante mostra poi la ricarica.
Fai il pieno|Raccogli le quattro scintille o premi Raccogli. Fiamma: tradizioni. Fulmine: azioni. Corona: difesa. Lampadina: ricerca più rapida.
Fai parlare di te|Usa Convinci: +24% influenza e +4 indignazione. Osserva entrambi gli indicatori.
Insediati per durare|Fonda una sede. Accelera la crescita locale senza inviare ambasciatori ogni giorno.
Risveglia una tradizione|Apri l’Officina: tradizioni per l’influenza, irradiazione per diffonderla, guardiani per proteggerla.
Avvia la diffusione|Scegli il primo livello evidenziato di Irradiazione. Ogni ramo si sblocca in ordine.|Apri l’Officina
Le idee richiedono tempo|Osserva il progresso. L’Ingegno accelera il lavoro senza consumarsi. Qui il tempo scorre a 4×.
Un sabotaggio si avvicina!|Segui la rotta rossa verso il santuario. Intercetta prima dell’impatto. Dal 23% d’indignazione la coalizione prepara gli attacchi.
Proteggi il tuo emblema|Un impatto dimostrativo lo ha danneggiato. Usa Restaura per recuperare 28 punti. A zero integrità perdi la campagna.
Allenta la tensione|Usa Placa: l’indignazione scende di 12 punti. Meno tensione significa meno sabotaggi.
Tocca a te decidere|Scegli una risposta. I simboli indicano guadagni e costi; la purezza delle tradizioni può calare temporaneamente.
Prenditi tempo per pensare|Metti in pausa con Ⅱ, Spazio o Start. Puoi ancora scegliere azioni durante la pausa.
Riavvia il tempo|Premi di nuovo lo stesso pulsante per riprendere.
Accelera la conquista|Premi 1× per passare a 2×, poi a 4×. Anche indignazione e attacchi avanzano più rapidamente!
Esplora il mondo|Usa +, rotella, pizzico o grilletti per lo zoom. Trascina o usa lo stick destro. ◎ ripristina la vista mondiale.
Scrivi la tua leggenda|La cultura si diffonde nel tempo. Raggiungi il 100% in tutti i 236 territori proteggendo l’emblema. Le prove non costano nulla alla campagna.|Gioca la mia campagna`;
const russian=`Ваше первое завоевание|Обучение использует настоящие команды. Испытайте все способности: кампания останется нетронутой.|Начать
Выберите другую страну|Коснитесь страны на карте или выберите её в Атласе. Стрелки территорий работают и с геймпадом.|Открыть Атлас
Отправьте посла|Нажмите «Отправить». Проследите за поездкой: страна получит 12% влияния. Затем кнопка покажет перезарядку.
Пополните запасы|Соберите четыре искры или нажмите «Собрать». Пламя: традиции. Молния: действия. Корона: защита. Лампочка: быстрая наука.
Заставьте о себе говорить|Используйте «Убедить»: +24% влияния и +4 возмущения. Следите за обоими индикаторами.
Основательно закрепитесь|Основывайте центр. Он ускоряет рост страны без ежедневной отправки послов.
Пробудите традицию|Откройте Мастерскую: традиции усиливают влияние, культурное распространение расширяет его, стражи защищают.
Начните распространение|Выберите подсвеченный первый уровень культурного влияния. Ветки открываются последовательно.|Открыть Мастерскую
Идеям нужно время|Следите за прогрессом. Интеллект ускоряет работу и не расходуется. Здесь время идёт на скорости 4×.
Приближается диверсия!|Проследите красный маршрут к святилищу. Перехватите до удара. От 23% возмущения коалиция готовит атаки.
Защитите эмблему|Учебный удар повредил её. Нажмите «Восстановить», чтобы вернуть 28 единиц. При нулевой прочности кампания проиграна.
Снизьте напряжение|Используйте «Успокоить»: возмущение снизится на 12 пунктов. Меньше напряжения — меньше диверсий.
Решение за вами|Выберите ответ. Символы показывают выгоды и затраты; чистота традиций тоже может временно упасть.
Время подумать|Поставьте игру на паузу с помощью Ⅱ, Пробела или Start. На паузе можно выбирать действия.
Запустите время|Снова нажмите ту же кнопку, чтобы продолжить.
Ускорьте завоевание|Нажмите 1× для перехода на 2×, затем на 4×. Возмущение и атаки тоже ускорятся!
Исследуйте мир|Масштабируйте с помощью +, колеса, жеста или триггеров. Перемещайте карту или правый стик. ◎ возвращает весь мир.
Напишите свою легенду|Культура распространяется со временем. Достигните 100% во всех 236 территориях, сохранив эмблему. Обучение ничего не стоило вашей кампании.|Играть кампанию`;
export const TUTORIAL_COPY=[source,chinese,italian,russian].map(text=>text.split('\n').map(row=>row.split('|')));
