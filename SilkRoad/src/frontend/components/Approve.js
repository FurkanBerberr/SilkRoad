import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'

export default function Approve({ silkroad, nft, account }) {
    const [loading, setLoading] = useState(true)
    const [approved, setApproved] = useState([])
    const loadApproveItems = async () => {
      // Load all sold items that the user listed
      const itemCount = await silkroad.itemCount()
      let approved = []
      for (let indx = 1; indx <= itemCount; indx++) {
        const i = await silkroad.items(indx)
        if (!i.mConfirm || !i.dConfirm || !i.bConfirm) {
          // get uri url from nft contract
          const uri = await nft.tokenURI(i.tokenId)
          // use uri to fetch the nft metadata stored on ipfs 
          const response = await fetch(uri)
          const metadata = await response.json()
          // get total price of item (item price + fee)
          const totalPrice = await silkroad.getTotalPrice(i.itemId)
          // define listed item object
          let item = {
            totalPrice,
            price: i.price,
            itemId: i.itemId,
            percent: i.percent,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
            type: metadata.type,
            color: metadata.color,
            amount: metadata.amount,
            seller: i.seller,
            buyer: i.buyer,
            dConfirm: i.dConfirm,
            mConfirm: i.mConfirm,
            bConfirm: i.bConfirm
          }
          // Add listed item to sold items array if sold
          if (!i.mConfirm || !i.dConfirm || !i.bConfirm) approved.push(item)
        }
      }
      setLoading(false)
      setApproved(approved)
    }

  const makeOffer = async (item) => {
    await (await silkroad.confirmManifacturer(item.itemId)).wait()
    loadApproveItems()
  }
  const approveOffer = async (item) => {
    await (await silkroad.confirmDesigner(item.itemId)).wait()
    loadApproveItems()
  }
  const recievedItem = async (item) => {
    await (await silkroad.confirmBuyer(item.itemId)).wait()
    loadApproveItems()
  }

  useEffect(() => {
    loadApproveItems()
  }, [])
  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )
  return (
    <div className="flex justify-center">
      {approved.length > 0 ?
        <div className="px-5 container">
        <Row xs={1} md={2} lg={4} className="g-4 py-5">
          {approved.map((item, idx) => (
            <Col key={idx} className="overflow-hidden">
              {(() => {
                if (item.seller?.toLowerCase() !== account && !item.mConfirm) {
                  return <Card>
                    <Card.Img variant="top" src={item.image} />
                    <Card.Body color="secondary">
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Text>
                        Description: {item.description}
                      </Card.Text>
                      <Card.Text>
                        Product Type: {item.type}
                      </Card.Text>
                      <Card.Text>
                        Color: {item.color}
                      </Card.Text>
                      <Card.Text>
                        Amount: {item.amount}
                      </Card.Text>
                    <Card.Text>
                      Designer Share: %{item.percent.toString()}
                    </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                      <div className='d-grid'>
                        <Button className="btn btn-success" onClick={() => makeOffer(item)} variant="primary" size="lg">
                          Make Offer
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>;
                } else if(item.seller.toLowerCase() === account && !item.dConfirm && item.mConfirm){
                  return <Card>
                    <Card.Img variant="top" src={item.image} />
                    <Card.Body color="secondary">
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Text>
                        Description: {item.description}
                      </Card.Text>
                      <Card.Text>
                        Product Type: {item.type}
                      </Card.Text>
                      <Card.Text>
                        Color: {item.color}
                      </Card.Text>
                      <Card.Text>
                        Amount: {item.amount}
                      </Card.Text>
                    <Card.Text>
                      Manifacturer Share: %{(100 - item.percent).toString()}
                    </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                      <div className='d-grid'>
                        <Button className="btn btn-success" onClick={() => approveOffer(item)} variant="primary" size="lg">
                          Approve Offer
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>;
                } else if(item.buyer.toLowerCase() === account && !item.bConfirm){
                  return <Card>
                    <Card.Img variant="top" src={item.image} />
                    <Card.Body color="secondary">
                      <Card.Title>{item.name}</Card.Title>
                      <Card.Text>
                        {item.description}
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                      <div className='d-grid'>
                        <Button className="btn btn-success" onClick={() => recievedItem(item)} variant="primary" size="lg">
                          Recieved Item
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>;
                }
              })()}
            </Col>
          ))}
        </Row>
      </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No approves</h2>
          </main>
        )}
    </div>
  );
}