
let col1 = document.getElementById('col1');
let col2 = document.getElementById('col2');
let col3 = document.getElementById('col3');
let col4 = document.getElementById('col4');

col1.style.backgroundColor = '#0080001c'

function changeContainer(id){
    for(let i = 1; i<7; i++){
        e = document.getElementById(i);
        e.style.display = "none";
    }
    c = document.getElementById(id);
    c.style.display = "block";

    if(id == '4'){
        col1.style.backgroundColor = 'transparent'
        col2.style.backgroundColor = '#0080001c'
        Swal.fire({
            title:"Parabéns! Você terminou a primeira parte.",
            icon: 'success',
            allowOutsideClick: false,
            padding: '1em'
        });
    }
    if(id == '7'){
        col2.style.backgroundColor = 'transparent';
        col3.style.backgroundColor = '#0080001c'
        Swal.fire({
            title:"Parabéns! Você terminou a segunda parte.",
            icon: 'success',
            allowOutsideClick: false,
            padding: '1em'
        });
    }
    if(id == '8'){
        col2.style.backgroundColor = 'transparent';
        col3.style.backgroundColor = '#0080001c'
        Swal.fire({
            title:"Parabéns! Você terminou a terceira parte.",
            icon: 'success',
            allowOutsideClick: false,
            padding: '1em'
        });
    }
}

function checkAnswer(id){
    e = document.getElementById('answer'+id)
    if(parseInt(id)<=4){
        e1 = document.getElementById('answer1');
        e2 = document.getElementById('answer2');
        e3 = document.getElementById('answer3');
        e4 = document.getElementById('answer4');
        if(id == '1'){
            e1.style.backgroundColor = '#0080001c';
            e2.style.backgroundColor = 'transparent';
            e3.style.backgroundColor = 'transparent';
            e4.style.backgroundColor = 'transparent';
        }else{
            e1.style.backgroundColor = 'transparent';
            e2.style.backgroundColor = 'transparent';
            e3.style.backgroundColor = 'transparent';
            e4.style.backgroundColor = 'transparent';
            e.style.backgroundColor = '#ff000063';
        }
    }else if(parseInt(id)>4 && parseInt(id)<9){
        e1 = document.getElementById('answer5');
        e2 = document.getElementById('answer6');
        e3 = document.getElementById('answer7');
        e4 = document.getElementById('answer8');
        if(id == '6'){
            e2.style.backgroundColor = '#0080001c';
            e1.style.backgroundColor = 'transparent';
            e3.style.backgroundColor = 'transparent';
            e4.style.backgroundColor = 'transparent';
        }else{
            e1.style.backgroundColor = 'transparent';
            e2.style.backgroundColor = 'transparent';
            e3.style.backgroundColor = 'transparent';
            e4.style.backgroundColor = 'transparent';
            e.style.backgroundColor = '#ff000063';
        }
    }
}

function changeSectionMenu(i){
    if(i == 'col1'){
        changeContainer('1');
        col1.style.backgroundColor = '#0080001c'
        col2.style.backgroundColor = 'transparent'
        col3.style.backgroundColor = 'transparent'
        col4.style.backgroundColor = 'transparent'
    }else if(i =='col2'){
        changeContainer('4');
        col2.style.backgroundColor = '#0080001c'
        col1.style.backgroundColor = 'transparent'
        col3.style.backgroundColor = 'transparent'
        col4.style.backgroundColor = 'transparent'
    }else if(i == 'col3'){
        changeContainer('7');
        col3.style.backgroundColor = '#0080001c'
        col1.style.backgroundColor = 'transparent'
        col2.style.backgroundColor = 'transparent'
        col4.style.backgroundColor = 'transparent'
    }else if(i == 'col4'){
        changeContainer('8');
        col4.style.backgroundColor = '#0080001c'
        col1.style.backgroundColor = 'transparent'
        col2.style.backgroundColor = 'transparent'
        col3.style.backgroundColor = 'transparent'
    }
}

