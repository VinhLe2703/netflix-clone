import React, { useState, useEffect } from 'react'
import { View, Dimensions, Text } from 'react-native'
import { db } from '../firebase'
import firebase from 'firebase/compat/app';
import { StatusBar } from 'expo-status-bar'
import { useNavigation } from '@react-navigation/native'
import styled from 'styled-components/native'
import Header from '../components/Header';
import { FontAwesome, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
    useFonts,
    Montserrat_200ExtraLight,
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold
} from "@expo-google-fonts/montserrat";

const Container = styled.ScrollView`
	flex: 1;
    background-color: #000;
`

const SearchBox = styled.View`
    width: 100%;
    height: 50px;
    background-color: #333333;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    padding-left: 0px;
    padding-right: 7px;
    margin: 20px;
    margin-left: 5px;
`

const SearchInput = styled.TextInput`
    color: #fff;
    font-size: 16px;
    margin: 5px;
`

const SearchBoxWrapper = styled.View`
width: 100%;
justify-content: center;
margin-top: 5px;
`

const TopResultsText = styled.Text`
    color: white;
    font-size: 28px;
    margin: 20px;
    margin-top: 10px;
    margin-left: 25px;
    font-family: "Montserrat_600SemiBold";
    font-weight: 600;
`

const MoviePoster = styled.Image`
	width: ${Math.round((Dimensions.get('window').width * 29.5) / 100)}px;
	height: 200px;
`

const MovieCard = styled.View`
	padding-right: 9px;
`

const ResultsWrapper = styled.View`
    flex-direction: row;
    flex-wrap: wrap;
    padding: 10px;
    justify-content: center;
`

const SearchScreen = () => {
    const navigation = useNavigation();
    const [search, setSearch] = useState('');
    const [results, setResults] = useState(null);
    const [results2, setResults2] = useState(null);

    let [fontsLoaded] = useFonts({
        Montserrat_200ExtraLight,
        Montserrat_300Light,
        Montserrat_400Regular,
        Montserrat_500Medium,
        Montserrat_600SemiBold,
        Montserrat_700Bold,
        Montserrat_800ExtraBold
    });

    useEffect(() => {
        db.collection('movie').onSnapshot(snapshot => {
            setResults(snapshot.docs.map((doc) => doc.data()))
        })

        setResults2(results);
    }, [])

    useEffect(() => {
        db.collection('movie').onSnapshot(snapshot => {
            setResults(snapshot.docs.map((doc) => doc.data()))
        })
        if (search && results) {
            const finalResults = results.filter(result => {
                const nameMatch = result.name && result.name.toLowerCase().indexOf(search.toLowerCase()) !== -1;
                const tapMatch = result.tap && result.tap.some(tapItem => tapItem.toLowerCase().indexOf(search.toLowerCase()) !== -1);
                return nameMatch || tapMatch;
            })
            setResults2(finalResults);
        }
    }, [search])
    

    return fontsLoaded && (
        <>
            <StatusBar style="light" />
            <Container>
                <Header login={true} goBack={navigation.goBack} />
                <SearchBoxWrapper>
                    <SearchBox>
                        <MaterialIcons name="search" size={30} color="#B1B1B1" style={{ margin: 10 }} />
                        <SearchInput value={search} onChangeText={(text) => setSearch(text)} placeholderTextColor="#7f7f7f" placeholder="Tìm kiếm chương trình, phim, thể loại, v.v." />
                        <TouchableOpacity activeOpacity={0.5}>
                            <MaterialCommunityIcons name="microphone" size={30} color="#b1b1b1" style={{ margin: 10, }} />
                        </TouchableOpacity>
                    </SearchBox>
                </SearchBoxWrapper>
                {
                    results2 && (
                        <>
                            <TopResultsText>Top tìm kiếm</TopResultsText>
                            <ResultsWrapper>
                                {results2.map((movie, item) => {
                                    return (
                                        <TouchableOpacity activeOpacity={0.5} key={item} onPress={() => {
                                            navigation.navigate("ViewMovie", {
                                                id: movie.id,
                                            })
                                        }}>
                                            <MovieCard>
                                                <MoviePoster resizeMode='cover' source={{ uri: movie.banner }} />
                                            </MovieCard>
                                        </TouchableOpacity>
                                    )
                                })}
                            </ResultsWrapper>
                        </>
                    )
                }
            </Container>
        </>
    )
}

export default SearchScreen