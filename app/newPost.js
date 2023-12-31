import {
    View,
    Text,
    SafeAreaView,
    TextInput,
    Button,
    Image,
  } from 'react-native';
  import { useState } from 'react';
  import { Feather, Ionicons } from '@expo/vector-icons';
  import * as ImagePicker from 'expo-image-picker';
  // import { Video } from 'expo-av';
  import { useRouter } from 'expo-router';
  import { DataStore, Storage } from 'aws-amplify';
  import { Post } from '../src/models';
  import { useAuthenticator } from '@aws-amplify/ui-react-native';
  import * as Crypto from 'expo-crypto';
  
  const imageStr="image";
  const videoStr="video";
  
  const NewPost = () => {
    const [text, setText] = useState('');
    const [selectedImage, setImage] = useState('');
    const [typeOfImage, setImageType] = useState('');
  
    const { user } = useAuthenticator();
  
    const router = useRouter();
  
    const onPost = async () => {
      // console.warn('Post: ', text);
      const imageKey = await uploadImage();

      // post entry to POST table in database
      await DataStore.save(
        new Post({ text, likes: 0, userID: user.attributes.sub, image: imageKey, imageType: typeOfImage })
      );
  
      setText('');
      setImage('');
      setImageType('');
      <Text style={{ fontWeight: '500', marginHorizontal: 10 }}> New post added </Text>;
    };

// Upload image or video asset to the s3 storage container    
    async function uploadImage() {
      try {
        let fileKey;
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        if (typeOfImage==imageStr) {
          fileKey = `${Crypto.randomUUID()}.png`;
        } else if (typeOfImage==videoStr) {
          fileKey = `${Crypto.randomUUID()}.mp4`;
        };
        await Storage.put(fileKey, blob,);
        return fileKey;
      } catch (err) {
        console.log('Yup, Error uploading file:', err, "filekey:", fileKey);
      }
    }
  
    const pickImage = async () => {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setImageType(imageStr);
      }
    };

    const pickVideo = async () => {
      // No permissions request is necessary for launching the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setImageType(videoStr);
      }
    };
  
    return (
      <SafeAreaView style={{ margin: 10 }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
        >
          <Ionicons
            onPress={() => router.back()}
            name="arrow-back"
            size={28}
            color="black"
            style={{ marginRight: 10 }}
          />
          <Text style={{ fontWeight: '500', fontSize: 20 }}>New post</Text>
        </View>
  
        <TextInput
          placeholder="Compose new post..."
          value={text}
          onChangeText={setText}
          // multiline
          numberOfLines={3}
        />
  
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 15, justifyContent: 'space-evenly' }}>
          <Feather onPress={pickImage} name="image" size={24} color="gray" />
          <Feather onPress={pickVideo} name="video" size={24} color="gray" />
        </View>
  
        {selectedImage && <Image src={selectedImage} style={{ width: '100%', aspectRatio: 1 }} />}
  
        <Button title="Post" onPress={onPost} />
      </SafeAreaView>
    );
  };
  
  export default NewPost;