/**
 * Created by leo on 15/6/7.
 */
/*
 每个脚本均需要实现 onIdle 函数，在游戏运行过程中，一旦脚本所控制的坦克处于空闲状态，游戏引擎就会调用脚本的 onIdle 函数，并将游戏的状态（如地图信息，坦克、炮弹和星星的位置，当前帧数）传递给该函数。在 onIdle 函数中，开发者需要做的就是根据游戏的状态向自己控制的坦克下达指令（前进、转向和开火）。当坦克执行完所有操作后，游戏引擎会再次请求 onIdle 函数，从而形成循环。

 游戏引擎会传递给 onIdle 3个参数，分别为 me, enemy 和 game，下面分别介绍。

 */

/*
me

me 对象包含己方坦克、炮弹的状态信息，除此之外还可以通过 me对象向己方坦克下达指令。me 的属性如下表所示。

属性	类型	说明
me.stars	Number	己方收集到的星星数量
me.tank	Object	己方坦克状态对象
me.tank.position	Array	坦克的位置，两个元素，分别为横坐标和纵坐标，从 0 起算。如 [0, 17]
me.tank.direction	String	坦克的朝向，可能取值为 "up", "down", "left", "right"。分别代表坦克朝上、朝下、朝左和朝右。
me.bullet	Object	炮弹的状态对象，和 me.tank 格式一样。如果场上不存在炮弹，则为 null。
me 的方法如下表所示。

方法	参数	说明
me.go(steps)	steps(Number) 表示前进步数，默认为 1	命令坦克前进指定步数
me.turn(direction)	direction(String) 表示转向，只能为 "left" 或 "right"	命令坦克向左（或向右）转弯
me.fire()	无	命令坦克朝当前方向发射一枚炮弹
需要注意的是方法并不是同步执行的（即不是等待坦克执行完指令后再继续运行代码），而是将指令放入一个队列中等待脚本执行结束再执行。当队列有指令，游戏引擎会执行队列中的指令，否则会调用 `onIdle` 函数获取指令。当坦克当前指令无效时，游戏引擎会清空指令队列。
    */

var baseObj = {
    position:[],
    direction:"left"
};
var me = {
    starts:0,
    tank:baseObj,
    bullet:baseObj,
    go:function(step){

    },
    turn:function(direction){

    },
    fire:function(){

    }
};

/*
 enemy

 enemy 对象包含敌方坦克、炮弹的状态信息。其属性和 me 完全相同，但不含有任何方法。当敌方坦克不可见时（在草丛中），enemy.tank 为 null，当敌方子弹不可见时，enemy.bullet 为 null
 */

var enemy = me;

/*
 game

 game 对象存储当前游戏状态，属性如下表所示。

 属性	类型	说明
 game.map	Array	游戏地图。二维数组，分别代表横坐标和纵坐标。每个元素均为一个字符，取值有 "." 表示空地、"x" 表示石头、"o" 表示草地。左上角为 [0, 0]。
 game.frames	Number	游戏当前帧数
 game.star	Array或null	当前星星位置，如果星星不存在则为 null
 */

var game = {
    map:[],
    frames:0,
    star:[]
};