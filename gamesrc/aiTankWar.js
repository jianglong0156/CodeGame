var lastDestPosition = null;
var curPathType = {
    STAR:2,
    ENEMY:2,
}
var MapType = {
    SPACE:1,
    STONE:2,
    GRASS:3
}

var PathObj = function(){
    this.prePoint = [];
    this.preIndex = [];
    this.point = [];
    this.hValue = 0;
    this.gValue = 0;
}

var me = {};
var enemy = {};
var game = {};

Array.prototype.remove = function (n) {
    if (n<0) return this;
    return this.slice(0,n).concat(this.slice(n+1,this.length));
};

var dataBase = {
    initFlag:true,
    tankCurrent:0,
    openList:[],
    closeList:[],
    runPath:[],
    pathType:0,
    clearAllData:function (){
        this.initFlag = true;
        this.tankCurrent = 0;
        this.openList = [];
        this.closeList = [];
        this.pathType = 0;
    }
};

function pEqual(src, dest) {
    if (!src || !dest) {
        return false;
    }
    return src[0] == dest[0] && src[1] == dest[1];
};

function getMapType(pos) {
    switch(game.map[pos[0]][pos[1]])
    {
        case '.':
            return MapType.SPACE;
        case 'x':
            return MapType.STONE;
        case 'o':
            return MapType.GRASS;
    }
};

function createsquareObj(preIndexInClose, prePoint, point, hValue, gValue) {
    var squareObj = new PathObj();
    squareObj.preIndex = preIndexInClose;
    squareObj.prePoint = prePoint.slice();
    squareObj.point = point.slice();
    squareObj.hValue = hValue;
    squareObj.gValue = gValue;
    return squareObj;
};

function calcHValue(startPoint, destPoint) {
    return Math.abs(destPoint[0] - startPoint[0]) + Math.abs(destPoint[1] - startPoint[1]);
};

function getPointIndexInArr(srcPoint, objList) {
    for (var objTemp = 0; objTemp < objList.length; objTemp++)
    {
        if (objList[objTemp].point[0] == srcPoint[0] &&
            objList[objTemp].point[1] == srcPoint[1])
        {
            return objTemp;
        }
    }
    return -1;
}

// 判断方块数据是否已经在对象列表中
function getSquareIndexInArr(squareObj, objList) {
    return getPointIndexInArr(squareObj.point, objList);
};

function findLowestSquareIndex() {
    var minIndex = -1;
    var minValue = 0;
    for (var openIndex = dataBase.openList.length - 1; openIndex >= 0; openIndex--) {
        var fValue = dataBase.openList[openIndex].hValue + dataBase.openList[openIndex].gValue;
        if (minValue == 0) {
            minValue = fValue;
            minIndex = openIndex;
        }

        if (minValue > fValue)
        {
            minValue = fValue;
            minIndex = openIndex;
        }
    }

    return minIndex;
};

function getRunPath(closeList) {
    var runPath = [];
    var lastSquare = closeList[closeList.length - 1];
    while (true)
    {
        runPath[runPath.length] = lastSquare;
        if (lastSquare.preIndex == -1)
        {
            break;
        }
        lastSquare = dataBase.closeList[lastSquare.preIndex];
    }
    runPath.reverse();
    return runPath;
};

// 将起始点周围的四个点放入open列表
function findMinPath(preIndexInClose, startPoint, baseGValue, destPoint) {
    var xPos = startPoint[0]
    var yPos = startPoint[1]
    var tankLeftP = [xPos - 1, yPos];
    var tankRightP = [xPos + 1, yPos];
    var tankUpP = [xPos, yPos - 1];
    var tankDownP = [xPos, yPos + 1];

    var pointArr = [tankLeftP, tankUpP, tankRightP, tankDownP];

    for (var pointIndex = 0; pointIndex < pointArr.length; pointIndex++) {
        // 判断坦克的周围是否有障碍物
        if (getMapType(pointArr[pointIndex], game) != MapType.STONE)
        {
            var squareObj = createsquareObj(preIndexInClose, startPoint, pointArr[pointIndex], calcHValue(pointArr[pointIndex], destPoint), baseGValue + 1);
            if (getSquareIndexInArr(squareObj, dataBase.closeList) == -1) {
                var openIndex = getSquareIndexInArr(squareObj, dataBase.openList);
                if (openIndex != -1)
                {
                    if (dataBase.openList[openIndex].hValue + dataBase.openList[openIndex].gValue >
                        squareObj.hValue + squareObj.gValue)
                        dataBase.openList[openIndex] = squareObj;
                }
                else
                {
                    dataBase.openList[dataBase.openList.length] = squareObj;
                }

            }
        }
    }


    var minIndex = findLowestSquareIndex();
    if (minIndex == -1)
    {
        print("error happen!!!!!!!!")
        return;
    }
    var minSquare = dataBase.openList[minIndex]
    // 添加到close列表，作为备选点
    var closeCurrentIndex = dataBase.closeList.length;
    dataBase.closeList[closeCurrentIndex] = minSquare;

    //print("openList wanto remove:" + minIndex + "   " + JSON.stringify(dataBase.openList));

    dataBase.openList = dataBase.openList.remove(minIndex);

    //print("closeList:" + JSON.stringify(dataBase.closeList));

    // 如果最小点已经是目标点了，那么返回列表
    if (minSquare.hValue == 0) {
        return;
    }
    else {
        findMinPath(closeCurrentIndex, minSquare.point, baseGValue + 1, destPoint);
    }
};

function createPath(startPoint, destPoint) {
    if (!pEqual(lastDestPosition, destPoint)){
        dataBase.clearAllData();
        lastDestPosition = destPoint;
    }

    var startHValue = calcHValue(startPoint, destPoint);



    var startObj = createsquareObj(-1, startPoint, startPoint, startHValue, 0);

    var closeCurrentIndex = dataBase.closeList.length;
    dataBase.closeList[closeCurrentIndex] = startObj;

    findMinPath(closeCurrentIndex, startPoint, 0, destPoint);

    return getRunPath(dataBase.closeList);

};

function changeToTargetDir(dirStr) {
    if (dirStr == me.tank.direction)
    {
        return;
    }
    switch (dirStr) {
        case "left":
            switch (me.tank.direction)
            {
                case "up":
                    me.turn("left");
                    break;
                case "down":
                    me.turn("right");
                    break;
                case "right":
                    me.turn("left");
                    me.turn("left");
                    break;
            }
            break;
        case "right":
            switch (me.tank.direction)
            {
                case "up":
                    me.turn("right");
                    break;
                case "down":
                    me.turn("left");
                    break;
                case "left":
                    me.turn("right");
                    me.turn("right");
                    break;
            }
            break;
        case "up":
            switch (me.tank.direction)
            {
                case "left":
                    me.turn("right");
                    break;
                case "right":
                    me.turn("left");
                    break;
                case "down":
                    me.turn("right");
                    me.turn("right");
                    break;
            }
            break;
        case "down":
            switch (me.tank.direction)
            {
                case "left":
                    me.turn("left");
                    break;
                case "right":
                    me.turn("right");
                    break;
                case "up":
                    me.turn("right");
                    me.turn("right");
                    break;
            }
            break;
    }
}

// 根据坦克这时候的方向，盒下一个点的目标方向，进行转向动作
function changeDirectionForNextPoint(curPoint, nextPoint) {
    var xPos = curPoint[0];
    var yPos = curPoint[1];
    var tankLeftP = [xPos - 1, yPos];
    var tankRightP = [xPos + 1, yPos];
    var tankUpP = [xPos, yPos - 1];
    var tankDownP = [xPos, yPos + 1];

    if (pEqual(tankLeftP, nextPoint)) {
        changeToTargetDir("left");
    }else if (pEqual(tankRightP, nextPoint)) {
        changeToTargetDir("right");
    }else if (pEqual(tankUpP, nextPoint)) {
        changeToTargetDir("up");
    }else if (pEqual(tankDownP, nextPoint)) {
        changeToTargetDir("down");
    }
}

function shootEnemy()
{
    if (!enemy.tank || !enemy.tank.position)
    {
        return;
    }

    if (me.tank.position[0] == enemy.tank.position[0] || me.tank.position[1] == enemy.tank.position[1])
    {
        if (!me.bullet)
        {
            me.fire();
        }

    }
}

function onIdle(meTemp, enemyTemp, gameTemp) {

    me = meTemp;
    enemy = enemyTemp;
    game = gameTemp;


    if (dataBase.initFlag)
    {
        if (game.star)
        {

            dataBase.pathType = curPathType.STAR;
            dataBase.runPath = createPath(me.tank.position, game.star);
            dataBase.initFlag = false;
        }
        else if (enemy.tank && enemy.tank.position)
        {
            dataBase.pathType = curPathType.ENEMY;
            dataBase.runPath = createPath(me.tank.position, enemy.tank.position);
            // 由于enemy 的位置是动态变化的，所以不需要将init重置为false
        }
    } else{
        print("1111111111:" + JSON.stringify(enemy.tank));
        if (dataBase.pathType == curPathType.ENEMY && game.star)
        {
            print("222222222");
            dataBase.pathType = curPathType.STAR;
            dataBase.runPath = createPath(me.tank.position, game.star);
            dataBase.initFlag = false;
        }
    }

    if (dataBase.tankCurrent >= dataBase.runPath.length - 1)
    {
        // 到达目的地
        dataBase.clearAllData();
        return;
    }

    var nextPoint = dataBase.runPath[dataBase.tankCurrent + 1].point;
    var curPoint = dataBase.runPath[dataBase.tankCurrent].point;

    var goIndex = getPointIndexInArr(me.tank.position, dataBase.runPath);

    // 命令不需要前置太多
    if (dataBase.tankCurrent - goIndex < 2)
    {
        changeDirectionForNextPoint(curPoint, nextPoint);

        me.go();

        dataBase.tankCurrent++;
    }


    shootEnemy();
    // 由于me.go需要耗费一帧的时间，而这个时候tank的位置还没有改变。所以可以预先设置指令
    //if (pEqual(me.tank.position, dataBase.runPath[dataBase.tankCurrent].point)) {
    //    me.go();
    //}
    //else
    //{
    //    print("running");
    //}
    //
    //if (pEqual(me.tank.position, dataBase.runPath[dataBase.tankCurrent + 1].point)) {
    //    dataBase.tankCurrent++;
    //}
    //else
    //{
    //    //dataBase.clearAllData();
    //}

};

