import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { db } from '../firebase';

const Container = styled.View`
  flex: 1;
  background-color: #000;
  padding: 20px;
`;

const MovieItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
`;

const MovieBanner = styled.Image`
  width: 100px;
  height: 150px;
  border-radius: 10px;
  margin-right: 15px;
`;

const MovieDetails = styled.View`
  flex: 1;
`;

const MovieTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #fff;
`;

const LikesCount = styled.Text`
  color: #fff;
`;

const MovieNumber = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  margin-right: 10px;
`;

const Taps = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 5px;
`;

const Tap = styled.Text`
  background-color: #f2f2f2;
  padding: 5px 10px;
  border-radius: 10px;
  margin-right: 5px;
  margin-bottom: 5px;
`;

const Rating = ({ navigation }) => {
  // Trạng thái để lưu trữ danh sách phim được đánh giá cao nhất
  const [topMovies, setTopMovies] = useState([]);

  // Fetch danh sách phim được đánh giá cao từ Firebase khi component được mount
  useEffect(() => {
    db.collection('movie')
      .orderBy('likes', 'desc')
      .limit(10)
      .get()
      .then(querySnapshot => {
        const movies = [];
        querySnapshot.forEach(doc => {
          movies.push({ id: doc.id, ...doc.data() });
        });
        setTopMovies(movies);
      })
      .catch(error => {
        console.error('Lỗi lấy danh sách phim đánh giá cao:', error);
      });
  }, []);

  return (
    <Container>
      <Text style={{ fontSize: 25, fontWeight: 'bold', marginBottom: 25, color: '#fff' }}>
        Top 10 bộ phim hay nhất
      </Text>

      {/* Danh sách phim được đánh giá cao */}
      <FlatList
        data={topMovies}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          // Mỗi phim là một thành phần có thể nhấp để chuyển đến trang chi tiết phim
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              navigation.navigate("ViewMovie", {
                id: item.id,
              });
            }}
          >
            {/* Bố cục chi tiết phim */}
            <MovieItem>
              <MovieNumber>{index + 1}</MovieNumber>
              <MovieBanner resizeMode='cover' source={{ uri: item.banner }} />
              <MovieDetails>
                <MovieTitle>{item.name}</MovieTitle>
                <LikesCount>{item.likes.length} lượt thích</LikesCount>
                
                {/* Hiển thị các thẻ của phim */}
                <Taps>
                  {item.tap.map((tap, index) => (
                    <Tap key={index}>{tap}</Tap>
                  ))}
                </Taps>
              </MovieDetails>
            </MovieItem>
          </TouchableOpacity>
        )}
      />
    </Container>
  );
};

export default Rating;
