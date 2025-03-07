# Miner AI

Um jogo 3D de mineração com ciclo dia/noite realista, desenvolvido com JavaScript e Three.js.

## 🎮 Características

- Mundo 3D gerado proceduralmente
- Ciclo dia/noite realista (10 minutos por ciclo completo)
- Sistema de iluminação dinâmico
- Efeitos visuais:
  - Sol e lua com movimento realista
  - Estrelas que aparecem gradualmente à noite
  - Nuvens em movimento
  - Transições suaves de cores do céu
  - Sombras dinâmicas

## 🛠️ Tecnologias Utilizadas

- **Three.js**: Motor 3D para renderização gráfica
  - Geometrias e materiais para objetos 3D
  - Sistema de iluminação (Ambient, Directional e Point lights)
  - Sistema de sombras dinâmicas
  - Sistema de partículas para efeitos visuais

- **JavaScript (ES6+)**
  - Classes e módulos
  - Programação orientada a objetos
  - Gerenciamento de eventos
  - Animações baseadas em tempo

## 🚀 Como Executar

1. **Pré-requisitos**
   - Navegador web moderno com suporte a WebGL
   - Servidor web local (pode usar Live Server do VS Code ou similar)

2. **Instalação**
   ```bash
   # Clone o repositório
   git clone [URL_DO_REPOSITÓRIO]

   # Entre no diretório
   cd miner-ai
   ```

3. **Executando**
   - Se estiver usando VS Code:
     1. Instale a extensão "Live Server"
     2. Clique com botão direito no arquivo `index.html`
     3. Selecione "Open with Live Server"
   
   - Ou inicie qualquer servidor web local na pasta do projeto:
     ```bash
     # Exemplo usando Python
     python -m http.server 8000
     ```
     Depois abra `http://localhost:8000` no navegador

## 🎮 Controles

- **W, A, S, D**: Movimento do jogador
- **Mouse**: Olhar ao redor
- **Clique Esquerdo**: Minerar/Interagir
- **Barra de Espaço**: Pular

## 🌟 Características Técnicas

### Sistema Dia/Noite
- Ciclo completo de 10 minutos
- Transições suaves baseadas na posição do sol
- Sistema de iluminação dinâmico
- Cores do céu mudam conforme horário:
  - Meio-dia: Azul claro
  - Pôr/Nascer do sol: Tons alaranjados
  - Noite: Azul escuro a preto

### Efeitos Visuais
- **Estrelas**:
  - Aparecem gradualmente ao anoitecer
  - Efeito de cintilação
  - Desaparecem ao amanhecer

- **Nuvens**:
  - Movimento contínuo
  - Transparência dinâmica
  - Geração procedural

## 🤝 Contribuindo

Sinta-se à vontade para contribuir com o projeto:
1. Faça um Fork
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adicionando nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 