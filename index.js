const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
canvas.width = 1024
canvas.height = 576

const gravity = 0.4

c.fillStyle = "rgb(50, 133, 0)"
c.fillRect(0, 0, canvas.width, canvas.height)

class Sprite
{
    constructor({position, velocity, color = 'red', offset})
    {
        this.position = position
        this.velocity = velocity
        this.width = 50
        this.height = 150
        this.lastKey
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            offset,
            width: 100,
            height: 25
        }
        this.color = color
        this.isAttacking
        this.health = 100
    }

    draw()
    {
        c.fillStyle = this.color
        c.fillRect(this.position.x, this.position.y, this.width, this.height)

        //attack box
        if(this.isAttacking)
        {
            c.fillStyle = 'pink'
            c.fillRect(this.attackBox.position.x, this.attackBox.position.y, this.attackBox.width, this.attackBox.height)
        }
    }

    update()
    {
        this.draw()

        //draw attackBox
        this.attackBox.position.x = this.position.x + this.attackBox.offset.x
        this.attackBox.position.y = this.position.y


        //movement function
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        //gravity function
        if(this.position.y + this.height + this.velocity.y >= canvas.height)
        {
            this.velocity.y = 0
        }
        else
        {
            this.velocity.y += gravity
        }
    }

    //attack function
    attack()
    {
        this.isAttacking = true
        setTimeout(() => {
            this.isAttacking = false
        },100)
    }
}

const player = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0
    },
    offset: {
        x: 0,
        y: 0
    }
})

// player.draw()

const enemy = new Sprite({
    position: {
        x: 400,
        y: 100
    },
    velocity: {
        x: 0,
        y: 0
    },
    color: 'blue',
    offset: {
        x: -50,
        y: 0
    }
})

const keys = 
{
    a :{
        pressed: false
    },

    d: {
        pressed: false
    },

    w: {
        pressed: false
    },

    ArrowLeft :{
        pressed: false
    },

    ArrowRight: {
        pressed: false
    },

    ArrowUp: {
        pressed: false
    }
}

// enemy.draw()

function rectangularCollision({rectangular1, rectangular2})
{
    return(
        rectangular1.attackBox.position.x + rectangular1.attackBox.width >= rectangular2.position.x && 
        rectangular1.attackBox.position.x <= rectangular2.position.x + rectangular2.width &&
        rectangular1.attackBox.position.y + rectangular1.attackBox.height >= rectangular2.position.y &&
        rectangular1.attackBox.position.y <= rectangular2.position.y + rectangular2.height 
    )
}

function determineWinner({player, enemy, timerID})
{
    clearTimeout(timerID)
    document.querySelector('.game-result').style.display = 'flex'
    if(player.health === enemy.health)
        {
            document.querySelector('.game-result').innerHTML = 'Draw!'
            // console.log('Hòa')
        }
        else if(player.health < enemy.health)
        {
            document.querySelector('.game-result').innerHTML = 'Player 2 Win!'
            // console.log('Enemy Win')
        }
        else if(player.health > enemy.health)
        {
            document.querySelector('.game-result').innerHTML = 'Player 1 Win!'
            // console.log('Player Win')
        }
        window.removeEventListener('keydown', false)
        window.removeEventListener('keyup', false)
}

let timer = 60
let timerID
function decreaseTimer()
{
    if(timer > 0)
    {
        timerID = setTimeout(decreaseTimer, 1000)
        timer--
        document.querySelector('.time').innerHTML = timer
    }

}

decreaseTimer()

function animate()
{
    window.requestAnimationFrame(animate)
    // console.log('abc')
    c.clearRect(0, 0, canvas.width, canvas.height)
    c.fillStyle = "rgb(50, 133, 0)"
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update()
    enemy.update()

    //player Movement
    player.velocity.x = 0
    if(keys.a.pressed && player.lastKey === 'a')
    {
        if(player.position.x < 1 || player.health < 1)
        {
            player.velocity.x = 0
        }
        else
        {
            player.velocity.x = -3
        }
    }

    else if(keys.d.pressed && player.lastKey === 'd')
    {
        if(player.position.x + player.width > canvas.width || player.health < 1)
        {
            player.velocity.x = 0
        }
        else
        {
            player.velocity.x = 3
        }
    }

    //enemy Movement
    enemy.velocity.x = 0
    if(keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft')
    {
        if(enemy.position.x < 1 || enemy.health < 1)
        {
            enemy.velocity.x = 0
        }
        else
        {
            enemy.velocity.x = -3
        }
    }

    else if(keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight')
    {
        if(enemy.position.x + enemy.width > canvas.width || enemy.health < 1)
        {
            enemy.velocity.x = 0
        }
        else
        {
            enemy.velocity.x = 3
        }
    }
 
    //attack Box trigger
    //player attack enemy
    if( rectangularCollision({
        rectangular1: player,
        rectangular2: enemy
    }) &&
        player.isAttacking)
    {
        player.isAttacking = false
        enemy.health -=10
        document.querySelector('.enemy-health').style.width = enemy.health + '%'
        console.log('enemy is attacked')
    }

     //enemy attack player
     if( rectangularCollision({
        rectangular1: enemy,
        rectangular2: player
    }) &&
        enemy.isAttacking)
    {
        enemy.isAttacking = false
        player.health -= 10
        document.querySelector('.player-health').style.width = player.health + '%'
        console.log('player is attacked')
    }

    //attackBox adjust
    if(player.position.x < enemy.position.x)
    {
        player.attackBox.offset.x = 0
        enemy.attackBox.offset.x = -50
    }
    else if(player.position.x > enemy.position.x)
    {
        player.attackBox.offset.x = -50
        enemy.attackBox.offset.x = 0
    }

    //end game by timer
    if(timer === 0)
    {
        determineWinner({player, enemy, timerID})
    }

    //end game by health
    if(player.health <= 0 || enemy.health <= 0)
    {
        determineWinner({player, enemy, timerID})
    }
}

animate()

window.addEventListener('keydown', (event) => {
    switch(event.key)
    {

        //player keyListener
        case 'd':
            keys.d.pressed = true
            player.lastKey = 'd'
            break
        
        case 'a':
            keys.a.pressed = true
            player.lastKey = 'a'
            break
        case 'w':
            if(player.position.y + player.height + player.velocity.y >= canvas.height && player.health > 1)
            {
                player.velocity.y = -15
            }
            break
        case 'f':
            if(player.health > 1)
            {
                player.attack()
                break
            }

        //enemy keyListener
        case 'ArrowRight':
            keys.ArrowRight.pressed = true
            enemy.lastKey = 'ArrowRight'
            break
        
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true
            enemy.lastKey = 'ArrowLeft'
            break
        case 'ArrowUp':
        if(enemy.position.y + enemy.height + enemy.velocity.y >= canvas.height && enemy.health > 1)
        {
            enemy.velocity.y = -15
        }
            break
        case 'm':
            if(enemy.health > 1)
            {
                enemy.attack()
                break
            }
    }
    // console.log(event.key)
})

window.addEventListener('keyup', (event) => {
    switch(event.key)
    {
        //player keyListener
        case 'd':
            keys.d.pressed = false
            break

        case 'a':
            keys.a.pressed = false
            break
        case 'w':
            keys.w.pressed = false
            break

        //enemy keyListener
        case 'ArrowRight':
            keys.ArrowRight.pressed = false
            break

        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break
        case 'ArrowUp':
            keys.ArrowUp.pressed = false
            break
    }
    // console.log(event.key)
})

console.log(player)