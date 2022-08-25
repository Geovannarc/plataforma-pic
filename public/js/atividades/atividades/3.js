

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
    }else if(parseInt(id)>=9 && parseInt(id)<12){

        e1 = document.getElementById('answer9');
        e2 = document.getElementById('answer10');
        e3 = document.getElementById('answer11');
        if(id == '11'){
            e3.style.backgroundColor = '#0080001c';
            e1.style.backgroundColor = 'transparent';
            e2.style.backgroundColor = 'transparent';
        }else{
            e1.style.backgroundColor = 'transparent';
            e2.style.backgroundColor = 'transparent';
            e3.style.backgroundColor = 'transparent';
            e.style.backgroundColor = '#ff000063';
        }
    }else if(parseInt(id)>=12 && parseInt(id)<16){
        e1 = document.getElementById('answer12');
        e2 = document.getElementById('answer13');
        e3 = document.getElementById('answer14');
        e4 = document.getElementById('answer15');
        if(id == '15'){
            e4.style.backgroundColor = '#0080001c';
            e1.style.backgroundColor = 'transparent';
            e2.style.backgroundColor = 'transparent';
            e3.style.backgroundColor = 'transparent';
        }else{
            e1.style.backgroundColor = 'transparent';
            e2.style.backgroundColor = 'transparent';
            e3.style.backgroundColor = 'transparent';
            e4.style.backgroundColor = 'transparent';
            e.style.backgroundColor = '#ff000063';
        }
    }
}

function changeContainerAtividades(id){
    for(let i = 1; i<id; i++){
        e = document.getElementById(i);
        e.style.display = "none";
    }
    c = document.getElementById(id);
    c.style.display = "block";

    if(id == '7'){
        col2.style.backgroundColor = 'transparent';
        col3.style.backgroundColor = '#0080001c'
        Swal.fire({
            title:"Parabéns! Você terminou a primeira parte.",
            icon: 'success',
            allowOutsideClick: false,
            padding: '1em'
        });
    }
}