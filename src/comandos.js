export const commands = [
    {
        name: 'somar',
        description: 'Comando para somar dois números',
        options: [{
            type: 10,
            name: 'n1',
            description: 'Digite o primeiro número',
            required: true
        },
        {
            type: 10,
            name: 'n2',
            description: 'Digite o segundo número',
            required: true
        }
        ],
    },
    {
        name: 'multiplicar',
        description: 'Comando para somar multiplicar dois números',
        options: [{
            type: 10,
            name: 'n1',
            description: 'Digite o primeiro número',
            required: true
        },
        {
            type: 10,
            name: 'n2',
            description: 'Digite o segundo número',
            required: true
        }
        ],
    },
    {
        name: 'slack',
        description: 'Olá Slack!'
    },
    {
        name: 'dog',
        description: 'Cachorro aleatório estilo quitéria...'
    },
    {
        name: 'adivinhar',
        description: 'tente adivinhar um número de 1 a 10 que o bot escolheu',
        options: [{
            type: 4,
            name: 'num',
            description: 'Digite o seu chute',
            required: true
        }]
    },
    {
        name: 'laura',
        description: 'Comando para fazer uma doação para a Laura'
    },
];



