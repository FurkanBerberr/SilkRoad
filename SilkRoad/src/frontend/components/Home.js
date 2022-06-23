import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'

const Home = ({ silkroad, nft }) => {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const loadMarketplaceItems = async () => {
    // Load all unsold items
    const itemCount = await silkroad.itemCount()
    let items = []
    for (let i = 1; i <= itemCount; i++) {
      const item = await silkroad.items(i)
      if (!item.sold && item.mConfirm && item.dConfirm) {
        // get uri url from nft contract
        const uri = await nft.tokenURI(item.tokenId)
        // use uri to fetch the nft metadata stored on ipfs 
        const response = await fetch(uri)
        const metadata = await response.json()
        // get total price of item (item price + fee)
        const totalPrice = await silkroad.getTotalPrice(item.itemId)
        // Add item to items array
        items.push({
          totalPrice,
          itemId: item.itemId,
          seller: item.seller,
          manifacturer: item.manifacturer,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          sold: item.sold,
          dConfirm: item.dConfirm,
          mConfirm: item.mConfirm
        })
        console.log(item.manifacturer)
      }
    }
    setLoading(false)
    setItems(items)
  }

  const buyMarketItem = async (item) => {
    await (await silkroad.purchaseItem(item.itemId, { value: item.totalPrice })).wait()
    loadMarketplaceItems()
  }

  useEffect(() => {
    loadMarketplaceItems()
  }, [])
  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )
  return (
    <div className="flex justify-center">
      {items.length > 0 ?
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {items.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <div class='border border-success rounded'>
                  <Card>
                    <div class='border-bottom border-success'>
                      <Card.Img variant="top" src={item.image} />
                      <Card.Body color="secondary">
                        <Card.Title>{item.name}</Card.Title>
                        <Card.Text>
                          {item.description}
                        </Card.Text>
                      </Card.Body>
                    </div>
                    <Card.Footer>
                      <div className='d-grid'>
                        <Button className="btn btn-success" onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                          Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>
                </div>
              </Col>
            ))}
          </Row>
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No listed assets</h2>
          </main>
        )}
    </div>
  );
}
export default Home