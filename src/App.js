import {useCallback, useEffect, useState} from "react";
import axios from 'axios'
import debounce from 'lodash.debounce'

const queryOpenLibraryAPI = async (query) => {
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=20`)
    return response.data.items
}

const Book = ({book}) => {

    if (!book || !book.hasOwnProperty('volumeInfo')) return null

    const book_ISBN_13_obj = book.volumeInfo?.industryIdentifiers?.find(ids => ids.type === "ISBN_13")

    if (!book.volumeInfo.hasOwnProperty('industryIdentifiers') || !book_ISBN_13_obj) {
        return null
    }

    const book_ISBN_13 = book_ISBN_13_obj.identifier
    const thumbnail_src = book.volumeInfo?.imageLinks?.thumbnail
    const goodreads_href = `https://www.goodreads.com/book/isbn/${book_ISBN_13}`
    const bookfinder_href = `https://www.bookfinder.com/search/?isbn=${book_ISBN_13}&st=xl&ac=qr`
    const published_date = book.volumeInfo?.publishedDate

    return <tr key={book_ISBN_13} className='books-table--book-row'>
        <td><img className='books-table--book-row--thumbnail' src={thumbnail_src} alt=""/></td>
        <td className='books-table--book-row--title'>{book.volumeInfo.title}</td>
        {published_date && <td className='books-table--book-row--published-date'>{published_date}</td>}
        <td className='books-table--book-row--author'>{book.volumeInfo?.authors?.map(author =>
            <div key={author}>{author}</div>)}</td>
        <td><a href={goodreads_href} className='books-table--book-row--link'>goodreads</a></td>
        <td><a href={bookfinder_href} className='books-table--book-row--link'>BookFinder</a></td>
    </tr>
}

const BookList = ({books}) => {
    return <table className='books-table'>
        <tbody className='books-table--body'>
        {books.map(book => <Book key={book.id} book={book}/>)}
        </tbody>
    </table>
}

function App() {
    const [bookQuery, setBookQuery] = useState('')
    const [debouncedBookQuery, setDebouncedBookQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(null)

    useEffect(() => {
        switch (debouncedBookQuery.trim()) {
            case '':
                setResults([]);
                setLoading(null)
                break;
            default:
                queryOpenLibraryAPI(debouncedBookQuery).then(books => {
                        setLoading(null)
                        if (books) setResults(books.slice(0, 20))
                    }
                )
        }
    }, [debouncedBookQuery])

    // eslint-disable-next-line
    const updateDebouncedBookQuery = useCallback(debounce((bookQuery) => { setDebouncedBookQuery(bookQuery) }, 300), [])

    const updateBookQuery = (event) => {
        event.preventDefault()
        setLoading(true)
        setBookQuery(event.target.value)
        updateDebouncedBookQuery(event.target.value)
    }

    const setBody = () => {
        if (loading) {
            return <h3>Loading...</h3>
        } else if (bookQuery.trim() === '') {
            return <h3>Welcome to Book Finder. Enter a search query!</h3>
        } else if (bookQuery.trim() !== '' && results.length === 0) {
            return <h3>No results, modify your search query.</h3>
        } else {
            return <BookList books={results}/>
        }
    }

    return (
        <div className="App">
            <div className='book-query-input'>
                <div className='book-query-input--title'>Find a book:</div>
                <div>
                    <input value={bookQuery} onChange={updateBookQuery} type='text'/>
                    <div className='book-query-input--description'>Enter a book title or author</div>
                </div>
            </div>
            {setBody()}
        </div>
    );
}

export default App;