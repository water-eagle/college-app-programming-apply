import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const [item, setItem] = useState('');
  const [shoppingList, setShoppingList] = useState([]);

  const handleAddItem = () => {
    if (item.trim().length === 0) return;
    setShoppingList([...shoppingList, { id: Date.now().toString(), text: item, completed: false }]);
    setItem('');
  };

  const deleteItem = (id) => {
    setShoppingList(shoppingList.filter((item) => item.id !== id));
  };

  const toggleItem = (id) => {
    setShoppingList(
      shoppingList.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🛒 Shopping List</Text>
      </View>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="장바구니에 담을 물건..."
          value={item}
          onChangeText={(text) => setItem(text)}
          onSubmitEditing={handleAddItem}
        />
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleAddItem}
          accessibilityRole="button"
        >
          <Text style={styles.addButtonText}>추가</Text>
        </TouchableOpacity>
      </View>

      {/* List Area */}
      <FlatList
        data={shoppingList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <TouchableOpacity 
              style={styles.itemTextContainer} 
              onPress={() => toggleItem(item.id)}
              accessibilityRole="button"
            >
              <Ionicons 
                name={item.completed ? "checkbox" : "square-outline"} 
                size={24} 
                color={item.completed ? "#4CAF50" : "#555"} 
              />
              <Text style={[styles.itemText, item.completed && styles.completedText]}>
                {item.text}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => deleteItem(item.id)}
              accessibilityRole="button"
              accessibilityLabel="삭제"
            >
              <Ionicons name="trash-outline" size={24} color="#FF5252" />
            </TouchableOpacity>
          </View>
        )}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 60,
    paddingHorizontal: 20,
    maxWidth: 600, // 웹 브라우저 가독성을 위해 최대 너비 제한
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemText: {
    fontSize: 17,
    color: '#333',
    marginLeft: 10,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
});
