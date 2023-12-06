import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  Text,
  View,
  FlatList,
  Dimensions,
} from "react-native";
import styled from 'styled-components/native';
import { useFonts, Montserrat_300Light, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Video } from 'expo-av';
import { Ionicons, Feather, AntDesign } from '@expo/vector-icons';
import { db, auth } from '../firebase';
import Header from '../components/Header'
import firebase from 'firebase/compat/app';


const Container = styled.ScrollView`
  flex: 1;
  background-color: #000;
`;

const Title = styled.Text`
    color: white;
    font-size: 24px;
    margin: 10px;
    font-family: "Montserrat_700Bold"
`

const MovieBadge = styled.Text`
    color: #a2a2a2;
    background-color: #373737;
    padding: 2px;
    border-radius: 5px;
    width: 38px;
    text-align: center;
    margin: 15px;
`

const Subtitle = styled.Text`
    color: #a2a2a2;
    margin: 5px;
`

const MovieSubDetails = styled.View`
    flex-direction: row;
    align-items: center;
    margin-top: -17px;
`


const MovieDescription = styled.Text`
    color: white;
    width: 98%;
    margin-left: 10px;
    margin: 10px;
    font-weight: 100;
    font-family: "Montserrat_300Light";
    line-height: 20px;
    margin-top: 25px;
`

const Tag = styled.Text`
    color: #fff;
    font-family: "Montserrat_400Regular";
`

const TagDot = styled.View`
    margin: 10px;
    background-color: white;
    height: 2px;
    width: 2px;
`

const Tags = styled.View`
flex-direction: row;
justify-content: center;
margin: 10px 0 5px 3px;
align-items: center;
flex-wrap: wrap;
width: 99%;
`

const TagWrapper = styled.View`
    flex-direction: row;
    align-items: center;
`

const ActionButtons2 = styled.View`
    flex-direction :row;
    justify-content: center;
    margin: 20px;
    align-items: center;
`

const ActionButton = styled.TouchableOpacity`
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 30px;
    margin-top: 20px;
`

const ActionButtonLabel = styled.Text`
    color: white;
    font-family: "Montserrat_300Light";
    font-size: 15px;
`
const widthDevice = Dimensions.get("window").width;


const ViewMovie = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState(null);
  const [user, setUser] = useState(null);
  const [liked, setLiked] = useState(false);
  const [idMovie, setIdMovie] = useState(route.params.id);
  const [movieTap, setMovieTap] = useState([]);

  useEffect(() => {
    const fetchMovieData = async () => {
      const userDoc = await db.collection('users').doc(auth.currentUser.email).get();
      setUser(userDoc.data());

      const movieDoc = await db.collection('movie').doc(route.params.id).get();
      setMovie(movieDoc.data());
      setLoading(false);
    };

    fetchMovieData();
  }, [route.params.id]);

  useEffect(() => {
    if (user && movie) {
      const userEmail = auth.currentUser.email;
      setLiked(movie.likes.includes(userEmail));
    }
  }, [user, movie]);

  let [fontsLoaded] = useFonts({
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_700Bold
  });

  const handleLike = () => {
    if (user && movie) {
      const userEmail = auth.currentUser.email;
      const likedByUser = movie.likes && movie.likes.includes(userEmail);
      if (likedByUser) {
        db.collection('movie').doc(route.params.id).update({
          likes: movie.likes.filter(email => email !== userEmail)
        }).then(() => {
          console.log('Đã xóa lượt thích khỏi phim');
          setLiked(false);
        }).catch(error => {
          console.error('Lỗi xóa lượt thích khỏi phim:', error);
        });
      } else {
        db.collection('movie').doc(route.params.id).update({
          likes: [...movie.likes, userEmail]
        }).then(() => {
          console.log('Thêm lượt thích vào phim');
          setLiked(true);
        }).catch(error => {
          console.error('Lỗi thêm like vào phim:', error);
        });
      }
    }
  };

  useEffect(() => {
    db.collection("movie")
      .doc(idMovie)
      .onSnapshot((doc) => {
        setMovie(doc.data());
        db.collection("movie").onSnapshot((snapshot) => {
          let movies = [];
          let moviesTapSection = [];
          doc.data()?.tap?.map((itemTapDetail) => {
            let listMovieCategory = [];
            snapshot?.docs?.map((item, index) => {
              if (item?.data()?.tap?.includes(itemTapDetail)) {
                listMovieCategory.push(item?.data());
              }
            });
            movies.push({
              title: itemTapDetail,
              data: listMovieCategory,
            });
          });
          movies?.map((item) => {
            if (item?.data?.length > 0) {
              moviesTapSection.push(item);
            }
          });
          setMovieTap(moviesTapSection);
        });
        setLoading(false);
      });
  }, [idMovie]);

  const renderSectionListTap = (data) => {
    return (
      <ScrollView
        horizontal
        disableIntervalMomentum={true}
        showsHorizontalScrollIndicator={false}
        style={{ marginLeft: 5, marginVertical: 15 }}
      >
        {data?.map((item, index) => {
          return (
            <TouchableOpacity
              onPress={() => {
                setIdMovie(item?.id);
              }}
              key={index}
              style={{ marginHorizontal: 8, width: widthDevice / 2.5 }}
            >
              <View style={{ position: "relative" }}>
                <Image
                  style={{ width: 120, height: 180 }}
                  source={{
                    uri: item?.banner,
                  }}
                />
                <Image
                  style={{
                    width: 50,
                    height: 50,
                    position: "absolute",
                    opacity: 0.5,
                    left: "30%",
                    top: "35%",
                  }}
                  source={require("../assets/play-icon.png")}
                />
              </View>
              <View style={{ marginTop: 5 }}>
                <Text numberOfLines={2} style={{ color: "#fff", fontSize: 16 }}>
                  {item?.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  return fontsLoaded && !loading ? (
    <>
      <StatusBar
        translucent
        backgroundColor='transparent'
        barStyle='light-content'
      />

      <Container>
      <Header login={true} goBack={navigation.goBack} />
      {
        user && user.isVip ? (
          <Video
          source={{ uri: movie?.videoURL }}
          isMuted={false}
          useNativeControls={true}
          shouldPlay={true}
          style={{ height: 225, marginTop: 15 }}
          resizeMode="contain"
          usePoster={true}
          posterSource={{ uri: movie?.banner }}
          shouldCorrectDeviceOrientation={true} 
        />
      ) : movie.isVip ? (
        <Tag>Bạn cần nâng cấp tài khoản để xem video này</Tag>
      ) : (
        <Video
        source={{ uri: movie?.videoURL }}
        isMuted={false}
        useNativeControls={true}
        shouldPlay={true}
        style={{ height: 225, marginTop: 15 }}
        resizeMode="contain"
        usePoster={true}
        posterSource={{ uri: movie?.banner }}
        shouldCorrectDeviceOrientation={true} 
       />
      )
    }

        <Title>{movie?.name}</Title>
        <MovieSubDetails>
            <MovieBadge>13+</MovieBadge>
            <Subtitle>{movie?.yearOfRelease}</Subtitle>
        </MovieSubDetails>
        <MovieDescription>
           {movie?.description}
        </MovieDescription>
        <Tags>
          {movie?.tap?.map((tap, i) => (
            <TagWrapper key={i}>
              <Tag>{tap}</Tag>
              {i + 1 === movie?.tap.length ? null : <TagDot />}
            </TagWrapper>
          ))}
        </Tags>
        <ActionButtons2>
        {
          user && user.list && user.list.includes(movie.id) ? (
            <ActionButton activeOpacity={0.5} onPress={() => {
              db.collection('users').doc(firebase.auth().currentUser.email).set({
              list: user.list.filter(item => item !== movie.id)
              }, { merge: true })
              .catch((error) => {
              console.error("Lỗi xóa phim khỏi danh sách:", error);
              });
            }}>
            <Feather name="check" size={35} color="white" />
            <ActionButtonLabel>Danh sách</ActionButtonLabel>
          </ActionButton>
          ) : (
            <ActionButton activeOpacity={0.5} onPress={() => {
              db.collection('users').doc(firebase.auth().currentUser.email).set({
              list: [...(user?.list || []), movie.id]
              }, { merge: true })
              .catch((error) => {
              console.error("Lỗi thêm phim vào danh sách:", error);
            });
          }}>
              <Ionicons name="add-outline" size={35} color="white" />
              <ActionButtonLabel>Danh sách</ActionButtonLabel>
            </ActionButton>
          )
        }
         <ActionButton activeOpacity={0.5} onPress={handleLike}>
            <AntDesign name="like2" size={30} color={liked ? 'red' : 'white'} style={{ marginBottom: 7 }} />
            <ActionButtonLabel>Thích</ActionButtonLabel>
          </ActionButton>
        </ActionButtons2>
        
          <FlatList
            data={movieTap}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => {
              return (
                <View style={{ flex: 1, marginBottom: 20 }}>
                  <Text
                    style={{ color: "#fff", marginVertical: 10, fontSize: 25 }}>
                    {item?.title.toUpperCase()}
                  </Text>
                  {renderSectionListTap(item?.data)}
                </View>
              );
            }}
          />
      </Container>
    </>
  ) : (
    <Container />
  );
};

export default ViewMovie;
