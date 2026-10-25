// Operation, conversion, victory, defeat, and three sabotage names.
const editions={
FR:[
 'OPERATION BAGUETTE WITHOUT BORDERS|demands a lunch break and a proper baguette|The planet complains in French. At last, a victory worth criticising.|The last baguette has gone soft. Even the ministry is speechless.|Plastic-wrapped sliced bread|International sourdough crisis|Microwaved baguette',
 '法棍无国界行动|要求午餐休息和正宗法棍|整个星球都用法语抱怨。终于有一场值得批评的胜利。|最后一根法棍变软了，连部长都无话可说。|塑料包装吐司|国际酵母危机|微波炉法棍',
 'OPERAZIONE BAGUETTE SENZA FRONTIERE|reclama una pausa pranzo e una vera baguette|Il pianeta si lamenta in francese. Finalmente una vittoria degna di critiche.|L’ultima baguette si è ammorbidita. Persino il ministero resta senza parole.|Pancarrè nella plastica|Crisi internazionale del lievito|Baguette al microonde',
 'ОПЕРАЦИЯ «БАГЕТ БЕЗ ГРАНИЦ»|требует обеденный перерыв и настоящий багет|Планета ворчит по-французски. Наконец-то победа, достойная критики.|Последний багет размяк. Даже министерству нечего сказать.|Хлеб в пластике|Международный кризис закваски|Багет из микроволновки'
],
GB:[
 'OPERATION WORLDWIDE TEA BREAK|puts the kettle on and joins the queue|The entire planet stops for tea. The kettle has never been so proud.|The kettle falls silent. This is rather concerning.|Microwaved water|Worldwide milk shortage|Abolition of queues',
 '全球茶歇行动|烧好水并加入队伍|整个星球停下来喝茶。水壶从未如此骄傲。|水壶沉默了。这实在令人担忧。|微波炉烧水|全球牛奶短缺|废除排队',
 'OPERAZIONE PAUSA TÈ MONDIALE|mette il bollitore e si unisce alla coda|Il pianeta si ferma per il tè. Il bollitore non è mai stato così fiero.|Il bollitore tace. È piuttosto preoccupante.|Acqua scaldata al microonde|Carenza mondiale di latte|Abolizione delle code',
 'ОПЕРАЦИЯ «ВСЕМИРНЫЙ ЧАЙНЫЙ ПЕРЕРЫВ»|ставит чайник и встаёт в очередь|Вся планета остановилась на чай. Чайник ещё никогда так не гордился.|Чайник умолк. Это весьма тревожно.|Вода из микроволновки|Мировая нехватка молока|Отмена очередей'
],
US:[
 'OPERATION FREEDOM XXL|orders a larger burger and applauds|The world orders XXL. Freedom tastes like cheese.|The grill goes cold. A sequel is already in production.|Adoption of the metric system|Soda cup size restrictions|Peanut butter tax',
 '超大自由行动|点了更大的汉堡并鼓掌|世界都点了超大份。自由是奶酪味的。|烤架冷却了，续集已在制作中。|改用公制|汽水杯限容|花生酱税',
 'OPERAZIONE LIBERTÀ XXL|ordina un hamburger più grande e applaude|Il mondo ordina XXL. La libertà sa di formaggio.|La griglia si raffredda. Il seguito è già in produzione.|Passaggio al sistema metrico|Limite alle dimensioni delle bibite|Tassa sul burro d’arachidi',
 'ОПЕРАЦИЯ «СВОБОДА XXL»|заказывает бургер побольше и аплодирует|Мир заказывает XXL. У свободы вкус сыра.|Гриль остыл. Продолжение уже в производстве.|Переход на метрическую систему|Ограничение размеров стаканов|Налог на арахисовую пасту'
],
IT:[
 'OPERATION GLOBAL FAMIGLIA|orders al dente and joins Nonna’s table|One planet, one family table. Nonna serves another course.|The oven goes cold. Nonna promises a rematch after lunch.|Spaghetti snapped in half|Cream in carbonara|Subsidised pineapple pizza',
 '全球家族行动|点了筋道意面并加入奶奶的餐桌|一个星球，一张家族餐桌。奶奶又端来一道菜。|烤炉冷却了。奶奶承诺午餐后再战。|折成两半的意面|奶油培根蛋面|补贴菠萝披萨',
 'OPERAZIONE FAMIGLIA MONDIALE|ordina al dente e si siede da Nonna|Un pianeta, una tavola di famiglia. Nonna serve un’altra portata.|Il forno si raffredda. Nonna promette la rivincita dopo pranzo.|Spaghetti spezzati a metà|Panna nella carbonara|Pizza all’ananas sovvenzionata',
 'ОПЕРАЦИЯ «ВСЕМИРНАЯ СЕМЬЯ»|заказывает аль денте и садится за стол Нонны|Одна планета, один семейный стол. Нонна подаёт ещё блюдо.|Печь остыла. Нонна обещает реванш после обеда.|Сломанные пополам спагетти|Сливки в карбонаре|Субсидии на пиццу с ананасом'
],
CN:[
 'OPERATION BAMBOO WITHOUT BORDERS|dances with the dragon and lights its lanterns|Lanterns light up the world. The Panda requests bamboo.|The last lantern goes out. The Panda takes a nap.|Unlit lanterns|Plastic bamboo|Karaoke without a microphone',
 '竹林无国界行动|舞起巨龙，点亮灯笼|灯笼照亮了世界。熊猫要求吃竹子。|最后一盏灯熄灭了，熊猫去午睡了。|不亮的灯笼|塑料竹子|没有麦克风的卡拉OK',
 'OPERAZIONE BAMBÙ SENZA FRONTIERE|fa danzare il drago e accende le lanterne|Le lanterne illuminano il mondo. Il Panda chiede bambù.|L’ultima lanterna si spegne. Il Panda va a fare la siesta.|Lanterne senza luce|Bambù di plastica|Karaoke senza microfono',
 'ОПЕРАЦИЯ «БАМБУК БЕЗ ГРАНИЦ»|танцует с драконом и зажигает фонари|Фонари осветили весь мир. Панда просит бамбук.|Последний фонарь погас. Панда уходит спать.|Негорящие фонари|Пластиковый бамбук|Караоке без микрофона'
],
RU:[
 'OPERATION TEA IN THE FREEZING COLD|installs a samovar and orders an ushanka|The planet is wrapped up warm. The Samovar has never been hotter.|The Samovar cools. The final tale will wait until tomorrow.|Cold tea|Paper ushanka|An unopenable matryoshka',
 '严寒热茶行动|装上茶炊并订购皮帽|整个星球都裹得暖暖的。茶炊从未如此滚烫。|茶炊冷却了。最后一个故事留待明天。|冷茶|纸皮帽|打不开的套娃',
 'OPERAZIONE TÈ NEL GRANDE FREDDO|installa un samovar e ordina un colbacco|Il pianeta è ben imbacuccato. Il Samovar non è mai stato così caldo.|Il Samovar si raffredda. L’ultima fiaba aspetterà domani.|Tè freddo|Colbacco di carta|Matrioska impossibile da aprire',
 'ОПЕРАЦИЯ «ЧАЙ В ЛЮТЫЙ МОРОЗ»|ставит самовар и заказывает ушанку|Планета закутана. Самовар ещё никогда не был таким горячим.|Самовар остывает. Последняя сказка подождёт до завтра.|Холодный чай|Бумажная ушанка|Неоткрывающаяся матрёшка'
],
MX:[
 'OPERATION PLANETARY FIESTA|sings with the mariachis and opens a taquería|One planet, one fiesta. The Sombrero can finally rest.|The Sombrero sags. The fiesta will return another day.|Tacos eaten with a fork|Chilli shortage|Sombrero in the rain',
 '全球嘉年华行动|与流浪乐队合唱并开设塔可店|一个星球，一场嘉年华。草帽终于能歇会儿了。|草帽塌了下来。嘉年华改日再续。|用叉子吃塔可|辣椒短缺|雨中的草帽',
 'OPERAZIONE FIESTA PLANETARIA|canta con i mariachi e apre una taquería|Un pianeta, una fiesta. Il Sombrero può finalmente riposare.|Il Sombrero si affloscia. La fiesta riprenderà un altro giorno.|Tacos con la forchetta|Carenza di peperoncino|Sombrero sotto la pioggia',
 'ОПЕРАЦИЯ «ПЛАНЕТАРНАЯ ФИЕСТА»|поёт с мариачи и открывает такерию|Одна планета, одна фиеста. Сомбреро наконец может отдохнуть.|Сомбреро поникло. Фиеста продолжится в другой день.|Тако вилкой|Нехватка острого перца|Сомбреро под дождём'
]
};
export const FLAVOUR_COPY=Object.fromEntries(Object.entries(editions).map(([id,rows])=>[id,rows.map(row=>row.split('|'))]));
