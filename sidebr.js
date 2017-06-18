import  { SQLite } from 'expo';
import React, {Component} from 'react';
import {
  StyleSheet,
  Navigator,
  Image,
  Text,
  View,
  TextInput,
  ListView,
  TouchableHighlight,
  ScrollView,
  AsyncStorage, Animated, Dimensions
} from 'react-native';
const window = Dimensions.get('window');
const db = SQLite.openDatabase({ name: 'db.db' });
    db.transaction(tx => {
      tx.executeSql('create table if not exists items (id integer primary key not null, tag text, title text, text text);');
      articles.forEach(function(item){
        tx.executeSql('insert into items (tag, title, text) values (?, ?, ?)', [item.tag, item.title, item.text]);
      })
    })
const STORAGE_KEY = '@AsyncStorageExample:key';

var navigator, index = 0;


export default class App extends Component {
  constructor(props){
    super(props);
  }

  render() {
    return (
      <Navigator 
      ref={(nav) => { navigator = nav; }} 
      initialRoute={{title: "main", index: 0, id: 0}} 
      renderScene = {(route, navigator) => {
        return <MyScene 
        id={route.id}
        title={route.title} 
        index = {route.index}
        onForward={(title, id=0) => {
          const nextIndex = route.index + 1;
          navigator.push({title: title, index:nextIndex, id: id});
        }}
        
        onBack = {() => {
          if (route.index > 0) {
            index = route.index;
            navigator.pop();
          }
        }}
        />
        }
      }
      />
    );
  }
}

class MyScene extends Component { 
  constructor(props){
    super(props);
    this.state = {title: this.props.title}
  }
  static get defaultProps() { 
    return { title: 'MyScene', id: 0 }; 
  } 
 getInitialState(){
   return {
     title: this.props.title,
     id: this.props.id
   }
 }
  render() {
    index = this.props.index;
      switch (this.props.title) {
        case 'main': 
        return (<Main onForward={this.props.onForward} />);
        case 'electro':
        return (<TopicList onForward={this.props.onForward} onBack={this.props.onBack} tag='electro' />);
        case 'review':
        return (<Review onForward={this.props.onForward} onBack={this.props.onBack} id={this.props.id} title={this.props.title} />);
        case 'favorite':
        return (<TopicList onForward={this.props.onForward} onBack={this.props.onBack} tag={this.props.title} />);
      } 
  } 
}


class Main extends Component {
  render() {
    return (
    <View style={[styles.container]}>
      <Image resizeMode='contain' style={{width: '100%', height: '60%'}}  source={{uri: 'http://yaneho.hol.es/assets/singleAssets/logo.png'}} />
      <View style={[styles.flex]}>
          <TouchableHighlight onPress = {() => this.props.onForward('electro')} style={[styles.icon]}>
            <View style={[styles.iconChild]}>
              <Image source={{uri: 'http://yaneho.hol.es/assets/singleAssets/contacts.png'}} style={styles.iconImg}/>
              <Text style={styles.iconTitle}>Контакты</Text>
            </View>
          </TouchableHighlight>
      </View>
    </View>
    );
  }
}

class TopicList extends Component {
  constructor(props){
    super(props);
    this.state = {
      title: this.props.title,
      inputValue: "You can change me!"
    }


  }
  static get defaultProps() { 
    return { 
      title: 'MyScene' 
    }; 
  }

  render() { 
    return ( 
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <TouchableHighlight style={styles.touchNav} onPress={this.props.onBack}>
            <Image style={styles.revImg} source={{uri: 'http://yaneho.hol.es/assets/singleAssets/back.png'}} />
          </TouchableHighlight>
          <TouchableHighlight style={styles.touchNav} onPress={this.props.onBack}>
            <Image resizeMode='contain' style={styles.revImg} source={{uri: 'http://yaneho.hol.es/assets/singleAssets/menu.png'}} />
          </TouchableHighlight>
          <Text style={styles.headerText}>{this.props.tag}</Text>
        </View>
        <View style={styles.content}>
          <ListViewDemo onForward={this.props.onForward} tag={this.props.tag} />
        </View>
      </View> 
      ); 
  }
}

class ListViewDemo extends Component {
  constructor(props) {
    super(props);
    this.props.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      topics: [],
      dataSource: this.props.ds.cloneWithRows([]),
      inputValue: ""
    };
  }
  _handleTextChange = inputValue => {
    this.setState({ inputValue });
  }
  
  _find = (inputValue) => {
    if (this.props.tag === 'Поиск') {
        db.transaction(tx => {
        tx.executeSql("select * from items where text like '%" +inputValue+"%'", 
        [], 
        (_, {rows: {_array}}) => this.setState({dataSource: this.props.ds.cloneWithRows(_array)})
        )
      })
    } else {
      db.transaction(tx => {
        tx.executeSql("select * from items where text like '%" +inputValue+"%' and tag=?", 
        [this.props.tag], 
        (_, {rows: {_array}}) => this.setState({dataSource: this.props.ds.cloneWithRows(_array)})
        )
      })
    }
  }
  componentDidMount() {
    this.update();
  }
  
  update(){
    db.transaction(tx => {
      tx.executeSql('select * from items where tag = ?', 
      [this.props.tag], 
      (_, {rows: {_array}}) => this.setState({dataSource: this.props.ds.cloneWithRows(_array)})
      )
    })
  }
  
  render() {
    if (this.state.dataSource.getRowCount() === 0) {
      return (<View style={{ width: '100%', height: '85%', padding: 8 }}>
          <View style={styles.searchBar}>
            <TextInput
              value={this.state.inputValue}
              onChangeText={this._handleTextChange}
              style={styles.searchInput}
            />
            <TouchableHighlight style={styles.search} onPress={() => this._find(this.state.inputValue)}>
              <Image resizeMode='contain' style={styles.revImg} source={{uri: 'http://yaneho.hol.es/assets/singleAssets/search.png'}} />
            </TouchableHighlight>
          </View>
        </View>);
    }
    return (
      <View style={{ width: '100%', height: '85%', padding: 8 }}>
        <View style={styles.searchBar}>
          <TextInput
                value={this.state.inputValue}
                onChangeText={this._handleTextChange}
                style={styles.searchInput}
              />
              <TouchableHighlight style={styles.search} onPress={() => this._find(this.state.inputValue)}>
                <Image resizeMode='contain'  style={styles.revImg} source={{uri: 'http://yaneho.hol.es/assets/singleAssets/search.png'}} />
              </TouchableHighlight>
        </View>
      <ListView
        style={styles.contentArticles}
        dataSource={this.state.dataSource}
        renderRow={(data) => <View style={styles.contentTopic}><TouchableHighlight style={styles.topicTouch} onPress={() => this.props.onForward('review', data.id)}><Text>{data.title}</Text></TouchableHighlight></View>}
        ref={ref => this.listView = ref}
        onContentSizeChange={() => {
        this.listView.scrollTo({y: 1})
        }}
      />
      </View>
    );
  }
}

class Review extends Component {

  constructor(props){
    super(props);
    this.state = {
      title: this.props.title,
      inputValue: "You can change me!",
      toggled: false,
      img: "http://yaneho.hol.es/assets/singleAssets/will_like.png",
      show: false
    }
    db.transaction(tx => {
      tx.executeSql('select * from items where id = ?', 
      [this.props.id], 
      (_, {rows: {_array}}) => {
        this.setState({
        id: _array[0].id,
        title: _array[0].title,
        text: _array[0].text
      });
        AsyncStorage.getItem(STORAGE_KEY + this.props.id, (err, res) => {if (res) this.update()})
      }
      )
    })
  }
  
  componentDidMount(){
    AsyncStorage.getItem(STORAGE_KEY + this.props.id, (err, res) => {if (res) this.update()
    }
  )
  }
  
  update() {
    this.setState({ img: "http://yaneho.hol.es/assets/singleAssets/did_likel.png", toggled: true })
  }

  static get defaultProps() { 
    return { 
      title: 'MyScene' 
    }; 
  }
  handlePress() {
    if (!this.state.toggled) {
      this.setState({ img: "http://yaneho.hol.es/assets/singleAssets/did_likel.png", toggled: true });
      AsyncStorage.setItem(STORAGE_KEY + this.state.id, JSON.stringify(this.state.id));
    } else {
      this.setState({ img: "http://yaneho.hol.es/assets/singleAssets/will_like.png", toggled: false });
      AsyncStorage.removeItem(STORAGE_KEY + this.state.id);
    }
  }

  render() { 
    return ( 
       <View style={styles.review}>
        <View style={styles.header}>
          <TouchableHighlight style={styles.touchNav} onPress={this.props.onBack}><Image style={styles.revImg} source={{uri: 'http://yaneho.hol.es/assets/singleAssets/back.png'}} />
          </TouchableHighlight>
          <TouchableHighlight style={styles.touchNav} onPress={() => {this.setState((state) => ({show: !state.show}))}}>
            <Image resizeMode='contain' style={styles.revImg} source={{uri: 'http://yaneho.hol.es/assets/singleAssets/menu.png'}} />
          </TouchableHighlight>
          <TouchableHighlight style={styles.touchNav} onPress={this.handlePress.bind(this)}><Image style={styles.revImg} source={{uri: this.state.img}} /></TouchableHighlight>
          
        </View>
        <ScrollView style={styles.reviewTextBlock}>
          <Text style={{textAlign: 'center', fontSize: 20}}>{this.state.title}</Text>
          <Text style={styles.reviewText}>{this.state.text}</Text>
        </ScrollView>
        {this.state.show && <Sidebar parent={this} onForward={this.props.onForward}/>}
       </View>
      ); 
  }
}

class Sidebar extends Component {
  constructor(props){
    super(props);
    this.state = {
      links: ['one', 'two', 'three', 'four', 'five', 'six'],
      fadeAnim: new Animated.Value(-window.width/2)
    }
  }
  
  componentDidMount(){
    Animated.timing(
      this.state.fadeAnim,
      {toValue:0,
      duration: 300
      }).start();
  }
  
  static get defaultProps() { 
    return { 
      title: 'MyScene' 
    }; 
  }

  render() {
    return (
      <Animated.View style={[styles.sidebar,{left: this.state.fadeAnim}]}>
          {this.state.links.map(link => (
            <TouchableHighlight 
            onPress={() => {Animated.timing(
            this.state.fadeAnim,
            {toValue:-window.width/3,
            duration: 300
            }).start(); this.props.parent.setState({show: false}); this.props.onForward('electro')}} style={styles.sidebarItem}><Text>{link}</Text></TouchableHighlight>
                  ))}
      </Animated.View>
      );
    }
}

const styles = StyleSheet.create({
  sidebar: {
    flex: 0.1,
    flexDirecrion: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    borderColor: '#ff0f00',
    borderWidth: 4,
    borderRadius: 6,
    backgroundColor: "white",
    width: window.width/3,
    left:-window.width/2,
    height: '85%',
    marginTop: '30%',
    paddingBottom: '95%',
    paddingTop: '95%',
    zIndex: 2
  },
  sidebarItem: {
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderTopWidth: 2,
    borderColor: '#ff0f00',
    alignItems: 'center',
    padding: 5,
  },
  iconImg: {
    height: 50,
    width: 50,
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
    textAlign: 'center',
    marginBottom: 35,
    width: "33%",
    height: 75,
  },
  iconChild: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconTitle: {
    color: '#ff0f00',
    fontSize: 18,
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center'
  },
  container: {
    height: '100%',
    justifyContent: 'flex-end'
  },
  flex: {
    flex: 0,
    height: '40%',
    flexDirection: "row",
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    
  },
    wrapper: {
    height: '100%',
    paddingTop: '5%'
    
  },
  content: {
    paddingTop: '2%',
    height: '100%',
    width: '100%',
    marginLeft: 0
  },
  contentArticles: {
    flex: 1,
    alignItems: 'center',
    textAlign: 'center',
    marginTop: 8
  },
  contentTopic: {
    paddingBottom: 20
  },
  topicTouch: {
    borderColor:'#ff0f00', 
    borderBottomWidth:2, 
    borderLeftWidth:2, 
    padding:2
  },
  review: {
    width: '100%',
    height: '100%',
    paddingTop: '5%',
  },
  touchNav: {
    width: '15%',
    justifyContent: 'center',
    alignItems: 'center',
    resizeMod: 'cover'
  },
  header: {
    borderColor: '#ff0f00',
    borderBottomWidth: 10,
    flex: 0, flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '15%',
    width: '100%',
    padding: '2%',
  },
  headerText: {
    color: '#ff0f00',
    fontSize: 12,
    width: '20%'
  },
  searchBar: {
    width: '100%',
    height: '10%',
    flex: 0, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth:4,
    borderColor: '#ff0f00',
    paddingBottom:2,
    marginBottom:6
  },
  searchInput: {
    width: '80%', 
    padding: 2,
    backgroundColor: '#ffeeee',
    borderRadius: 6
  },
  search: {
    width: '15%',
    height: '100%'
  },
  revImg: {
    width: '100%',
    height: '100%',
    resizeMode:'contain'
  },
  reviewTextBlock: {
    padding: 0,
    paddingBottom:30,
    flexDirection: 'column',
    flex: 1,
  },
  reviewText: {
    padding: 10,
    textAlign: 'justify'
  },
  tags: {
    width: '100%',
    textAlign: 'center'
  },
  tagsVars: {
    width:'95%', 
    textAlign: 'center', 
    fontSize: 20, 
    borderColor:'#ff0f00',
    borderWidth: 2, 
    borderRadius:5, 
    backgroundColor:'rgba(255,20,0,0.8)', 
    margin: '1%', 
    padding: '2%'
  }
});

const articles = [
{
  id: 1,
  tag: 'pte',
  title: "Тахионный пульсар: методология и особенности",
  text: 'Эфемерида ничтожно перечеркивает эффективный диаметp, тем не менее, Дон Еманс включил в список всего 82-е Великие Кометы. Весеннее равноденствие пространственно неоднородно.'
},
{
  id: 2,
  tag: 'tormoza',
  title: "Межядерный погранслой в XXI веке",
  text: 'Различное расположение, это удалось kekes установить по характеру спектра, дает эффективный диаметp.'
},
{
  id: 3,
  tag: 'electro',
  title: "Почему последовательно квантовое состояние?",
  text: 'Как было показано выше, натуральный логарифм последовательно ищет случайный Юпитер. '
},
{
  id: 6,
  tag: 'pte',
  title: "Эксимер как излучение",
  text: 'Приливное трение выбирает далекий болид . Узел, по определению, дает надир.'
},
]